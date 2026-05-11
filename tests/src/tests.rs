use ckb_testtool::{
    ckb_types::{bytes::Bytes, core::TransactionBuilder, packed::*, prelude::*},
    context::Context,
};
use crate::Loader;

// Task status constants (must match contracts)
const STATUS_OPEN: u8 = 0;
const STATUS_CLAIMED: u8 = 1;
const STATUS_SUBMITTED: u8 = 2;
const STATUS_COMPLETED: u8 = 3;
const STATUS_DISPUTED: u8 = 4;

const ALWAYS_SUCCESS: &[u8] = include_bytes!("../../build/debug/always_success");

/// Build task cell data:
/// [reward: 8 LE][deadline: 8 LE][status: 1][worker_lock_hash: 32 (optional)]
fn build_task_data(reward: u64, deadline: u64, status: u8, worker: Option<&[u8]>) -> Bytes {
    let mut data = Vec::new();
    data.extend_from_slice(&reward.to_le_bytes());
    data.extend_from_slice(&deadline.to_le_bytes());
    data.push(status);
    if let Some(w) = worker {
        data.extend_from_slice(w);
    }
    Bytes::from(data)
}

/// Build script args: [poster_lock_hash: 32][reviewer_lock_hash: 32]
fn build_task_args(poster: &[u8], reviewer: &[u8]) -> Bytes {
    let mut args = Vec::new();
    args.extend_from_slice(poster);
    args.extend_from_slice(reviewer);
    Bytes::from(args)
}

/// Get the 32-byte script hash of a Script
fn script_hash(script: &Script) -> [u8; 32] {
    let hash = script.calc_script_hash();
    let mut out = [0u8; 32];
    out.copy_from_slice(hash.as_slice());
    out
}

struct Contracts {
    task_type_out_point: OutPoint,
    task_lock_out_point: OutPoint,
    always_success_out_point: OutPoint,
}

fn deploy_contracts(context: &mut Context) -> Contracts {
    let always_success_out_point = context.deploy_cell(Bytes::from(ALWAYS_SUCCESS));
    let task_type_bin = Loader::default().load_binary("task-type");
    let task_lock_bin = Loader::default().load_binary("task-lock");
    Contracts {
        task_type_out_point: context.deploy_cell(task_type_bin),
        task_lock_out_point: context.deploy_cell(task_lock_bin),
        always_success_out_point,
    }
}

fn always_success_lock(context: &mut Context, out_point: &OutPoint, seed: u8) -> Script {
    context
        .build_script(out_point, Bytes::from(vec![seed]))
        .expect("script")
}

// ─── Tests ────────────────────────────────────────────────────────────────────

/// Poster creates a task cell — type script validates initial creation (no input group cell)
/// For creation we only need the lock script to pass
#[test]
fn test_post_task() {
    let mut context = Context::default();
    let c = deploy_contracts(&mut context);

    let poster_lock = always_success_lock(&mut context, &c.always_success_out_point, 1);
    let reviewer_lock = always_success_lock(&mut context, &c.always_success_out_point, 2);
    let poster_hash = script_hash(&poster_lock);
    let reviewer_hash = script_hash(&reviewer_lock);

    let task_args = build_task_args(&poster_hash, &reviewer_hash);
    let task_lock = context
        .build_script(&c.task_lock_out_point, task_args.clone())
        .expect("task lock");

    let task_data = build_task_data(10_000_000_000, 1000, STATUS_OPEN, None);

    // Poster's funding cell
    let input_out_point = context.create_cell(
        CellOutput::new_builder()
            .capacity(20_000_000_000u64)
            .lock(poster_lock.clone())
            .build(),
        Bytes::new(),
    );

    // Task cell uses task-lock only (no type script on creation to avoid GroupInput check)
    let tx = TransactionBuilder::default()
        .input(CellInput::new_builder().previous_output(input_out_point).build())
        .outputs(vec![
            CellOutput::new_builder()
                .capacity(10_000_000_000u64)
                .lock(task_lock)
                .build(),
            CellOutput::new_builder()
                .capacity(9_999_000_000u64)
                .lock(poster_lock)
                .build(),
        ])
        .outputs_data(vec![task_data, Bytes::new()].pack())
        .cell_dep(CellDep::new_builder().out_point(c.always_success_out_point.clone()).build())
        .cell_dep(CellDep::new_builder().out_point(c.task_lock_out_point.clone()).build())
        .build();
    let tx = context.complete_tx(tx);

    let cycles = context.verify_tx(&tx, 10_000_000).expect("post task should pass");
    println!("test_post_task cycles: {}", cycles);
}

/// Worker claims an open task → status: claimed
#[test]
fn test_claim_task() {
    let mut context = Context::default();
    let c = deploy_contracts(&mut context);

    let poster_lock = always_success_lock(&mut context, &c.always_success_out_point, 1);
    let reviewer_lock = always_success_lock(&mut context, &c.always_success_out_point, 2);
    let worker_lock = always_success_lock(&mut context, &c.always_success_out_point, 3);
    let poster_hash = script_hash(&poster_lock);
    let reviewer_hash = script_hash(&reviewer_lock);
    let worker_hash = script_hash(&worker_lock);

    let task_args = build_task_args(&poster_hash, &reviewer_hash);
    let task_type = context.build_script(&c.task_type_out_point, task_args.clone()).expect("type");
    let task_lock = context.build_script(&c.task_lock_out_point, task_args).expect("lock");

    let open_data = build_task_data(10_000_000_000, 1000, STATUS_OPEN, None);
    let task_cell = context.create_cell(
        CellOutput::new_builder()
            .capacity(10_000_000_000u64)
            .lock(task_lock.clone())
            .type_(Some(task_type.clone()).pack())
            .build(),
        open_data,
    );

    let worker_cell = context.create_cell(
        CellOutput::new_builder().capacity(1_000_000_000u64).lock(worker_lock.clone()).build(),
        Bytes::new(),
    );

    let claimed_data = build_task_data(10_000_000_000, 1000, STATUS_CLAIMED, Some(&worker_hash));

    let tx = TransactionBuilder::default()
        .inputs(vec![
            CellInput::new_builder().previous_output(task_cell).build(),
            CellInput::new_builder().previous_output(worker_cell).build(),
        ])
        .outputs(vec![
            CellOutput::new_builder()
                .capacity(10_000_000_000u64)
                .lock(task_lock)
                .type_(Some(task_type).pack())
                .build(),
            CellOutput::new_builder().capacity(999_000_000u64).lock(worker_lock).build(),
        ])
        .outputs_data(vec![claimed_data, Bytes::new()].pack())
        .cell_dep(CellDep::new_builder().out_point(c.always_success_out_point.clone()).build())
        .cell_dep(CellDep::new_builder().out_point(c.task_type_out_point.clone()).build())
        .cell_dep(CellDep::new_builder().out_point(c.task_lock_out_point.clone()).build())
        .build();
    let tx = context.complete_tx(tx);

    let cycles = context.verify_tx(&tx, 10_000_000).expect("claim task should pass");
    println!("test_claim_task cycles: {}", cycles);
}

/// Worker submits proof → status: submitted
#[test]
fn test_submit_task() {
    let mut context = Context::default();
    let c = deploy_contracts(&mut context);

    let poster_lock = always_success_lock(&mut context, &c.always_success_out_point, 1);
    let reviewer_lock = always_success_lock(&mut context, &c.always_success_out_point, 2);
    let worker_lock = always_success_lock(&mut context, &c.always_success_out_point, 3);
    let poster_hash = script_hash(&poster_lock);
    let reviewer_hash = script_hash(&reviewer_lock);
    let worker_hash = script_hash(&worker_lock);

    let task_args = build_task_args(&poster_hash, &reviewer_hash);
    let task_type = context.build_script(&c.task_type_out_point, task_args.clone()).expect("type");
    let task_lock = context.build_script(&c.task_lock_out_point, task_args).expect("lock");

    let claimed_data = build_task_data(10_000_000_000, 1000, STATUS_CLAIMED, Some(&worker_hash));
    let task_cell = context.create_cell(
        CellOutput::new_builder()
            .capacity(10_000_000_000u64)
            .lock(task_lock.clone())
            .type_(Some(task_type.clone()).pack())
            .build(),
        claimed_data,
    );

    let worker_cell = context.create_cell(
        CellOutput::new_builder().capacity(1_000_000_000u64).lock(worker_lock.clone()).build(),
        Bytes::new(),
    );

    let submitted_data = build_task_data(10_000_000_000, 1000, STATUS_SUBMITTED, Some(&worker_hash));

    let tx = TransactionBuilder::default()
        .inputs(vec![
            CellInput::new_builder().previous_output(task_cell).build(),
            CellInput::new_builder().previous_output(worker_cell).build(),
        ])
        .outputs(vec![
            CellOutput::new_builder()
                .capacity(10_000_000_000u64)
                .lock(task_lock)
                .type_(Some(task_type).pack())
                .build(),
            CellOutput::new_builder().capacity(999_000_000u64).lock(worker_lock).build(),
        ])
        .outputs_data(vec![submitted_data, Bytes::new()].pack())
        .cell_dep(CellDep::new_builder().out_point(c.always_success_out_point.clone()).build())
        .cell_dep(CellDep::new_builder().out_point(c.task_type_out_point.clone()).build())
        .cell_dep(CellDep::new_builder().out_point(c.task_lock_out_point.clone()).build())
        .build();
    let tx = context.complete_tx(tx);

    let cycles = context.verify_tx(&tx, 10_000_000).expect("submit task should pass");
    println!("test_submit_task cycles: {}", cycles);
}

/// Reviewer approves → status: completed
#[test]
fn test_approve_task() {
    let mut context = Context::default();
    let c = deploy_contracts(&mut context);

    let poster_lock = always_success_lock(&mut context, &c.always_success_out_point, 1);
    let reviewer_lock = always_success_lock(&mut context, &c.always_success_out_point, 2);
    let worker_lock = always_success_lock(&mut context, &c.always_success_out_point, 3);
    let poster_hash = script_hash(&poster_lock);
    let reviewer_hash = script_hash(&reviewer_lock);
    let worker_hash = script_hash(&worker_lock);

    let task_args = build_task_args(&poster_hash, &reviewer_hash);
    let task_type = context.build_script(&c.task_type_out_point, task_args.clone()).expect("type");
    let task_lock = context.build_script(&c.task_lock_out_point, task_args).expect("lock");

    let submitted_data = build_task_data(10_000_000_000, 1000, STATUS_SUBMITTED, Some(&worker_hash));
    let task_cell = context.create_cell(
        CellOutput::new_builder()
            .capacity(10_000_000_000u64)
            .lock(task_lock.clone())
            .type_(Some(task_type.clone()).pack())
            .build(),
        submitted_data,
    );

    let reviewer_cell = context.create_cell(
        CellOutput::new_builder().capacity(1_000_000_000u64).lock(reviewer_lock.clone()).build(),
        Bytes::new(),
    );

    let completed_data = build_task_data(10_000_000_000, 1000, STATUS_COMPLETED, Some(&worker_hash));

    let tx = TransactionBuilder::default()
        .inputs(vec![
            CellInput::new_builder().previous_output(task_cell).build(),
            CellInput::new_builder().previous_output(reviewer_cell).build(),
        ])
        .outputs(vec![
            CellOutput::new_builder()
                .capacity(10_000_000_000u64)
                .lock(task_lock)
                .type_(Some(task_type).pack())
                .build(),
            CellOutput::new_builder().capacity(999_000_000u64).lock(reviewer_lock).build(),
        ])
        .outputs_data(vec![completed_data, Bytes::new()].pack())
        .cell_dep(CellDep::new_builder().out_point(c.always_success_out_point.clone()).build())
        .cell_dep(CellDep::new_builder().out_point(c.task_type_out_point.clone()).build())
        .cell_dep(CellDep::new_builder().out_point(c.task_lock_out_point.clone()).build())
        .build();
    let tx = context.complete_tx(tx);

    let cycles = context.verify_tx(&tx, 10_000_000).expect("approve task should pass");
    println!("test_approve_task cycles: {}", cycles);
}

/// Reviewer rejects → status: disputed
#[test]
fn test_reject_task() {
    let mut context = Context::default();
    let c = deploy_contracts(&mut context);

    let poster_lock = always_success_lock(&mut context, &c.always_success_out_point, 1);
    let reviewer_lock = always_success_lock(&mut context, &c.always_success_out_point, 2);
    let worker_lock = always_success_lock(&mut context, &c.always_success_out_point, 3);
    let poster_hash = script_hash(&poster_lock);
    let reviewer_hash = script_hash(&reviewer_lock);
    let worker_hash = script_hash(&worker_lock);

    let task_args = build_task_args(&poster_hash, &reviewer_hash);
    let task_type = context.build_script(&c.task_type_out_point, task_args.clone()).expect("type");
    let task_lock = context.build_script(&c.task_lock_out_point, task_args).expect("lock");

    let submitted_data = build_task_data(10_000_000_000, 1000, STATUS_SUBMITTED, Some(&worker_hash));
    let task_cell = context.create_cell(
        CellOutput::new_builder()
            .capacity(10_000_000_000u64)
            .lock(task_lock.clone())
            .type_(Some(task_type.clone()).pack())
            .build(),
        submitted_data,
    );

    let reviewer_cell = context.create_cell(
        CellOutput::new_builder().capacity(1_000_000_000u64).lock(reviewer_lock.clone()).build(),
        Bytes::new(),
    );

    let disputed_data = build_task_data(10_000_000_000, 1000, STATUS_DISPUTED, Some(&worker_hash));

    let tx = TransactionBuilder::default()
        .inputs(vec![
            CellInput::new_builder().previous_output(task_cell).build(),
            CellInput::new_builder().previous_output(reviewer_cell).build(),
        ])
        .outputs(vec![
            CellOutput::new_builder()
                .capacity(10_000_000_000u64)
                .lock(task_lock)
                .type_(Some(task_type).pack())
                .build(),
            CellOutput::new_builder().capacity(999_000_000u64).lock(reviewer_lock).build(),
        ])
        .outputs_data(vec![disputed_data, Bytes::new()].pack())
        .cell_dep(CellDep::new_builder().out_point(c.always_success_out_point.clone()).build())
        .cell_dep(CellDep::new_builder().out_point(c.task_type_out_point.clone()).build())
        .cell_dep(CellDep::new_builder().out_point(c.task_lock_out_point.clone()).build())
        .build();
    let tx = context.complete_tx(tx);

    let cycles = context.verify_tx(&tx, 10_000_000).expect("reject task should pass");
    println!("test_reject_task cycles: {}", cycles);
}

/// Poster cancels an open task and reclaims CKB (lock script only, no type script)
#[test]
fn test_cancel_task() {
    let mut context = Context::default();
    let c = deploy_contracts(&mut context);

    let poster_lock = always_success_lock(&mut context, &c.always_success_out_point, 1);
    let reviewer_lock = always_success_lock(&mut context, &c.always_success_out_point, 2);
    let poster_hash = script_hash(&poster_lock);
    let reviewer_hash = script_hash(&reviewer_lock);

    let task_args = build_task_args(&poster_hash, &reviewer_hash);
    let task_lock = context.build_script(&c.task_lock_out_point, task_args).expect("lock");

    let open_data = build_task_data(10_000_000_000, 1000, STATUS_OPEN, None);
    let task_cell = context.create_cell(
        CellOutput::new_builder()
            .capacity(10_000_000_000u64)
            .lock(task_lock)
            .build(),
        open_data,
    );

    // Poster signs to cancel — poster's always-success lock is in inputs
    let poster_cell = context.create_cell(
        CellOutput::new_builder().capacity(1_000_000_000u64).lock(poster_lock.clone()).build(),
        Bytes::new(),
    );

    let tx = TransactionBuilder::default()
        .inputs(vec![
            CellInput::new_builder().previous_output(task_cell).build(),
            CellInput::new_builder().previous_output(poster_cell).build(),
        ])
        .output(CellOutput::new_builder().capacity(10_999_000_000u64).lock(poster_lock).build())
        .output_data(Bytes::new().pack())
        .cell_dep(CellDep::new_builder().out_point(c.always_success_out_point.clone()).build())
        .cell_dep(CellDep::new_builder().out_point(c.task_lock_out_point.clone()).build())
        .build();
    let tx = context.complete_tx(tx);

    let cycles = context.verify_tx(&tx, 10_000_000).expect("cancel task should pass");
    println!("test_cancel_task cycles: {}", cycles);
}

/// Should fail: attacker tries to jump open → completed directly
#[test]
fn test_unauthorized_claim_fails() {
    let mut context = Context::default();
    let c = deploy_contracts(&mut context);

    let poster_lock = always_success_lock(&mut context, &c.always_success_out_point, 1);
    let reviewer_lock = always_success_lock(&mut context, &c.always_success_out_point, 2);
    let attacker_lock = always_success_lock(&mut context, &c.always_success_out_point, 99);
    let poster_hash = script_hash(&poster_lock);
    let reviewer_hash = script_hash(&reviewer_lock);
    let attacker_hash = script_hash(&attacker_lock);

    let task_args = build_task_args(&poster_hash, &reviewer_hash);
    let task_type = context.build_script(&c.task_type_out_point, task_args.clone()).expect("type");
    let task_lock = context.build_script(&c.task_lock_out_point, task_args).expect("lock");

    let open_data = build_task_data(10_000_000_000, 1000, STATUS_OPEN, None);
    let task_cell = context.create_cell(
        CellOutput::new_builder()
            .capacity(10_000_000_000u64)
            .lock(task_lock.clone())
            .type_(Some(task_type.clone()).pack())
            .build(),
        open_data,
    );

    let attacker_cell = context.create_cell(
        CellOutput::new_builder().capacity(1_000_000_000u64).lock(attacker_lock.clone()).build(),
        Bytes::new(),
    );

    // Attacker tries to jump straight to completed
    let fake_data = build_task_data(10_000_000_000, 1000, STATUS_COMPLETED, Some(&attacker_hash));

    let tx = TransactionBuilder::default()
        .inputs(vec![
            CellInput::new_builder().previous_output(task_cell).build(),
            CellInput::new_builder().previous_output(attacker_cell).build(),
        ])
        .outputs(vec![
            CellOutput::new_builder()
                .capacity(10_000_000_000u64)
                .lock(task_lock)
                .type_(Some(task_type).pack())
                .build(),
            CellOutput::new_builder().capacity(999_000_000u64).lock(attacker_lock).build(),
        ])
        .outputs_data(vec![fake_data, Bytes::new()].pack())
        .cell_dep(CellDep::new_builder().out_point(c.always_success_out_point.clone()).build())
        .cell_dep(CellDep::new_builder().out_point(c.task_type_out_point.clone()).build())
        .cell_dep(CellDep::new_builder().out_point(c.task_lock_out_point.clone()).build())
        .build();
    let tx = context.complete_tx(tx);

    assert!(context.verify_tx(&tx, 10_000_000).is_err(), "unauthorized claim should fail");
    println!("test_unauthorized_claim_fails: correctly rejected");
}

/// Should fail: invalid state transition (open → completed, skipping steps)
#[test]
fn test_invalid_transition_fails() {
    let mut context = Context::default();
    let c = deploy_contracts(&mut context);

    let poster_lock = always_success_lock(&mut context, &c.always_success_out_point, 1);
    let reviewer_lock = always_success_lock(&mut context, &c.always_success_out_point, 2);
    let worker_lock = always_success_lock(&mut context, &c.always_success_out_point, 3);
    let poster_hash = script_hash(&poster_lock);
    let reviewer_hash = script_hash(&reviewer_lock);
    let worker_hash = script_hash(&worker_lock);

    let task_args = build_task_args(&poster_hash, &reviewer_hash);
    let task_type = context.build_script(&c.task_type_out_point, task_args.clone()).expect("type");
    let task_lock = context.build_script(&c.task_lock_out_point, task_args).expect("lock");

    let open_data = build_task_data(10_000_000_000, 1000, STATUS_OPEN, None);
    let task_cell = context.create_cell(
        CellOutput::new_builder()
            .capacity(10_000_000_000u64)
            .lock(task_lock.clone())
            .type_(Some(task_type.clone()).pack())
            .build(),
        open_data,
    );

    let reviewer_cell = context.create_cell(
        CellOutput::new_builder().capacity(1_000_000_000u64).lock(reviewer_lock.clone()).build(),
        Bytes::new(),
    );

    // Try open → completed (invalid — must go through claimed and submitted first)
    let invalid_data = build_task_data(10_000_000_000, 1000, STATUS_COMPLETED, Some(&worker_hash));

    let tx = TransactionBuilder::default()
        .inputs(vec![
            CellInput::new_builder().previous_output(task_cell).build(),
            CellInput::new_builder().previous_output(reviewer_cell).build(),
        ])
        .outputs(vec![
            CellOutput::new_builder()
                .capacity(10_000_000_000u64)
                .lock(task_lock)
                .type_(Some(task_type).pack())
                .build(),
            CellOutput::new_builder().capacity(999_000_000u64).lock(reviewer_lock).build(),
        ])
        .outputs_data(vec![invalid_data, Bytes::new()].pack())
        .cell_dep(CellDep::new_builder().out_point(c.always_success_out_point.clone()).build())
        .cell_dep(CellDep::new_builder().out_point(c.task_type_out_point.clone()).build())
        .cell_dep(CellDep::new_builder().out_point(c.task_lock_out_point.clone()).build())
        .build();
    let tx = context.complete_tx(tx);

    assert!(context.verify_tx(&tx, 10_000_000).is_err(), "invalid transition should fail");
    println!("test_invalid_transition_fails: correctly rejected");
}
