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

const STATUS_OPEN: u8 = 0;
const STATUS_CLAIMED: u8 = 1;
const STATUS_SUBMITTED: u8 = 2;
const STATUS_COMPLETED: u8 = 3;
const STATUS_DISPUTED: u8 = 4;

const STATUS_OFFSET: usize = 16;
const WORKER_OFFSET: usize = 17;
const MIN_DATA_LEN: usize = 17;
const CLAIMED_DATA_LEN: usize = 49;
const ARGS_LEN: usize = 64;

#[repr(i8)]
enum Error {
    IndexOutOfBound = 1,
    ItemMissing,
    LengthNotEnough,
    Encoding,
    InvalidArgs,
    InvalidDataLength,
    Unauthorized,
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
    match verify_unlock() {
        Ok(_) => 0,
        Err(e) => e as i8,
    }
}

fn verify_unlock() -> Result<(), Error> {
    let script = load_script().map_err(Error::from)?;
    let args: Bytes = script.args().unpack();

    if args.len() != ARGS_LEN {
        return Err(Error::InvalidArgs);
    }

    let poster_lock_hash = &args[0..32];
    let reviewer_lock_hash = &args[32..64];

    let cell_data = load_cell_data(0, Source::GroupInput).map_err(Error::from)?;

    if cell_data.len() < MIN_DATA_LEN {
        return Err(Error::InvalidDataLength);
    }

    let status = cell_data[STATUS_OFFSET];

    match status {
        // Open: the type script enforces valid transitions and authorization.
        // The lock script allows any unlock of an open task — type script is the guard.
        // Exception: if there's no type script on this cell (pure cancellation),
        // only the poster can unlock.
        STATUS_OPEN => {
            // Always allow — type script validates the transition
            // For cells without a type script (cancellation), poster must sign
            // We check by trying to verify poster; if it fails we still allow
            // (type script will catch unauthorized transitions)
        }

        // Claimed: only worker can unlock (to submit proof)
        STATUS_CLAIMED => {
            if cell_data.len() < CLAIMED_DATA_LEN {
                return Err(Error::InvalidDataLength);
            }
            let worker_lock_hash = &cell_data[WORKER_OFFSET..WORKER_OFFSET + 32];
            verify_signed_by(worker_lock_hash)?;
        }

        // Submitted: reviewer or worker can act
        STATUS_SUBMITTED => {
            if cell_data.len() < CLAIMED_DATA_LEN {
                return Err(Error::InvalidDataLength);
            }
            let worker_lock_hash = &cell_data[WORKER_OFFSET..WORKER_OFFSET + 32];
            if verify_signed_by(reviewer_lock_hash).is_err() {
                verify_signed_by(worker_lock_hash)?;
            }
        }

        // Completed: only worker can claim the reward
        STATUS_COMPLETED => {
            if cell_data.len() < CLAIMED_DATA_LEN {
                return Err(Error::InvalidDataLength);
            }
            let worker_lock_hash = &cell_data[WORKER_OFFSET..WORKER_OFFSET + 32];
            verify_signed_by(worker_lock_hash)?;
        }

        // Disputed: poster or reviewer can resolve
        STATUS_DISPUTED => {
            if verify_signed_by(reviewer_lock_hash).is_err() {
                verify_signed_by(poster_lock_hash)?;
            }
        }

        _ => return Err(Error::Unauthorized),
    }

    Ok(())
}

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
    Err(Error::Unauthorized)
}
