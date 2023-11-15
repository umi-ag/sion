use anchor_lang::prelude::*;
// use bbs_plus::prelude::*;

declare_id!("3tAumiPi7KEf16enYscuVFHMA3TttW8peEcg7A6H2DLk");

#[program]
pub mod counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
