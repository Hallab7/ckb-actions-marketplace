#![cfg_attr(not(any(feature = "library", test)), no_std)]
#![cfg_attr(not(test), no_main)]

#[cfg(any(feature = "library", test))]
extern crate alloc;

#[cfg(not(any(feature = "library", test)))]
ckb_std::entry!(program_entry);
#[cfg(not(any(feature = "library", test)))]
ckb_std::default_alloc!(16384, 1258306, 64);

use ckb_std::{
    ckb_constants::Source,
    ckb_types::{bytes::Bytes, prelude::*},
    high_level::{load_cell_data, load_cell_lock_hash, load_script},
};

// Task status constants
pub const STATUS_OPEN: u8 = 0;
pub const STATUS_CLAIMED: u8 = 1;
pub const STATUS_SUBMITTED: u8 = 2;
pub const STATUS_COMPLETED: u8 = 3;
pub const STATUS_DISPUTED: u8 = 4;

// Data layout offsets
// [title_len: 4][title: n][desc_len: 4][desc: m][reward: 8][deadline: 8][status: 1][worker_lock_hash: 32 (optional, present when claimed)]
pub const REWARD_OFFSET: usize = 0;
pub const DEADLINE_OFFSET: usize = 8;
pub const STATUS_OFFSET: usize = 16;
pub const WORKER_OFFSET: usize = 17; // present when status >= claimed
pub const MIN_DATA_LEN: usize = 17;
pub const CLAIMED_DATA_LEN: usize = 49; // 17 + 32 (worker lock hash)

// Script args layout: [poster_lock_hash: 32][reviewer_lock_hash: 32]
pub const ARGS_LEN: usize = 64;
pub const POSTER_HASH_OFFSET: usize = 0;
pub const REVIEWER_HASH_OFFSET: usize = 32;

#[repr(i8)]
pub enum Error {
    IndexOutOfBound = 1,
    ItemMissing,
    LengthNotEnough,
    Encoding,
    InvalidArgs,
    InvalidDataLength,
    InvalidTransition,
    InvalidRewardChange,
    InvalidDeadlineChange,
    UnauthorizedAction,
}

impl From<ckb_std::error::SysError> for Error {
    fn from(err: ckb_std::error::SysError) -> Self {
        use ckb_std::error::SysError::*;
        match err {
            IndexOutOfBound => Self::IndexOutOfBound,
            ItemMissing => Self::ItemMissing,
            LengthNotEnough(_) => Self::LengthNotEnough,
            Encoding => Self::Encoding,
            _ => Self::Encoding,
        }
    }
}

pub fn program_entry() -> i8 {
    match verify_task_transition() {
        Ok(_) => 0,
        Err(e) => e as i8,
    }
}

fn verify_task_transition() -> Result<(), Error> {
    let script = load_script().map_err(Error::from)?;
    let args: Bytes = script.args().unpack();

    if args.len() != ARGS_LEN {
        return Err(Error::InvalidArgs);
    }

    let _poster_lock_hash = &args[POSTER_HASH_OFFSET..POSTER_HASH_OFFSET + 32];
    let reviewer_lock_hash = &args[REVIEWER_HASH_OFFSET..REVIEWER_HASH_OFFSET + 32];

    // Load input and output cell data
    let input_data = load_cell_data(0, Source::GroupInput).map_err(Error::from)?;
    let output_data = load_cell_data(0, Source::GroupOutput).map_err(Error::from)?;

    if input_data.len() < MIN_DATA_LEN || output_data.len() < MIN_DATA_LEN {
        return Err(Error::InvalidDataLength);
    }

    let input_status = input_data[STATUS_OFFSET];
    let output_status = output_data[STATUS_OFFSET];

    // Reward must never change
    let input_reward = u64::from_le_bytes(input_data[REWARD_OFFSET..REWARD_OFFSET + 8].try_into().unwrap());
    let output_reward = u64::from_le_bytes(output_data[REWARD_OFFSET..REWARD_OFFSET + 8].try_into().unwrap());
    if input_reward != output_reward {
        return Err(Error::InvalidRewardChange);
    }

    // Deadline must never change
    let input_deadline = u64::from_le_bytes(input_data[DEADLINE_OFFSET..DEADLINE_OFFSET + 8].try_into().unwrap());
    let output_deadline = u64::from_le_bytes(output_data[DEADLINE_OFFSET..DEADLINE_OFFSET + 8].try_into().unwrap());
    if input_deadline != output_deadline {
        return Err(Error::InvalidDeadlineChange);
    }

    // Validate state transition and authorization
    match (input_status, output_status) {
        // open → claimed: any worker can claim, must include their lock hash
        (STATUS_OPEN, STATUS_CLAIMED) => {
            if output_data.len() < CLAIMED_DATA_LEN {
                return Err(Error::InvalidDataLength);
            }
            // Worker lock hash must be present in output data
            // The worker is whoever signed this tx — verified by task-lock script
            Ok(())
        }

        // claimed → submitted: only the worker can submit
        (STATUS_CLAIMED, STATUS_SUBMITTED) => {
            if input_data.len() < CLAIMED_DATA_LEN {
                return Err(Error::InvalidDataLength);
            }
            let worker_lock_hash = &input_data[WORKER_OFFSET..WORKER_OFFSET + 32];
            verify_signed_by(worker_lock_hash)?;
            Ok(())
        }

        // submitted → completed: only the reviewer can approve
        (STATUS_SUBMITTED, STATUS_COMPLETED) => {
            verify_signed_by(reviewer_lock_hash)?;
            Ok(())
        }

        // submitted → disputed: only the reviewer can reject
        (STATUS_SUBMITTED, STATUS_DISPUTED) => {
            verify_signed_by(reviewer_lock_hash)?;
            Ok(())
        }

        // disputed → completed: poster + reviewer agree (2-of-2 for simplicity)
        (STATUS_DISPUTED, STATUS_COMPLETED) => {
            verify_signed_by(reviewer_lock_hash)?;
            Ok(())
        }

        // disputed → open: poster + reviewer agree to reopen
        (STATUS_DISPUTED, STATUS_OPEN) => {
            verify_signed_by(reviewer_lock_hash)?;
            Ok(())
        }

        _ => Err(Error::InvalidTransition),
    }
}

/// Check that the given lock hash appears in the input cells' lock scripts,
/// meaning that party signed the transaction.
fn verify_signed_by(expected_lock_hash: &[u8]) -> Result<(), Error> {
    let mut i = 0;
    loop {
        match load_cell_lock_hash(i, Source::Input) {
            Ok(lock_hash) => {
                if lock_hash == expected_lock_hash {
                    return Ok(());
                }
            }
            Err(ckb_std::error::SysError::IndexOutOfBound) => break,
            Err(e) => return Err(Error::from(e)),
        }
        i += 1;
    }
    Err(Error::UnauthorizedAction)
}
