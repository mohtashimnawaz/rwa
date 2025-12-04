use anchor_lang::prelude::*;

declare_id!("DYMKJAp7o44QC7ZwB6JFbJY4mkDDtoAMbrwsTCrZqcj3");

#[program]
pub mod rwa {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
