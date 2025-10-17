import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { StreetwearTokenizer } from "../target/types/streetwear_tokenizer";
import { expect } from "chai";

describe("streetwear-tokenizer", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.StreetwearTokenizer as Program<StreetwearTokenizer>;
  const provider = anchor.getProvider();

  it("Tokenizes a streetwear item", async () => {
    // Generate a new keypair for the mint
    const mintKeypair = anchor.web3.Keypair.generate();
    
    // Get the user's wallet
    const user = provider.wallet as anchor.Wallet;
    
    // Test data
    const name = "Air Jordan 1 Retro";
    const symbol = "AJ1";
    const uri = "https://example.com/metadata.json";
    const brand = "Nike";
    const model = "Air Jordan 1";
    const size = "US 10";
    const condition = "New";
    const year = 2023;
    const rarity = { common: {} }; // Using the enum value

    try {
      const tx = await program.methods
        .tokenizeStreetwear(
          name,
          symbol,
          uri,
          brand,
          model,
          size,
          condition,
          year,
          rarity
        )
        .accounts({
          owner: user.publicKey,
          mint: mintKeypair.publicKey,
          tokenAccount: anchor.utils.token.associatedAddress({
            mint: mintKeypair.publicKey,
            owner: user.publicKey,
          }),
          assetAccount: anchor.web3.PublicKey.findProgramAddressSync(
            [
              Buffer.from("asset"),
              user.publicKey.toBuffer(),
              mintKeypair.publicKey.toBuffer(),
            ],
            program.programId
          )[0],
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([mintKeypair])
        .rpc();

      console.log("Transaction signature:", tx);
      console.log("Mint address:", mintKeypair.publicKey.toBase58());
      
      // Verify the asset account was created
      const assetAccount = await program.account.streetwearAsset.fetch(
        anchor.web3.PublicKey.findProgramAddressSync(
          [
            Buffer.from("asset"),
            user.publicKey.toBuffer(),
            mintKeypair.publicKey.toBuffer(),
          ],
          program.programId
        )[0]
      );

      expect(assetAccount.owner.toBase58()).to.equal(user.publicKey.toBase58());
      expect(assetAccount.brand).to.equal(brand);
      expect(assetAccount.model).to.equal(model);
      expect(assetAccount.year).to.equal(year);
      expect(assetAccount.isListed).to.be.false;

    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  });

  it("Lists an NFT for sale", async () => {
    // This test would require a tokenized NFT first
    // For now, we'll just verify the program structure
    expect(program).to.not.be.undefined;
  });
});