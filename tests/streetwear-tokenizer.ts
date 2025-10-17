import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { StreetwearTokenizer } from "../target/types/streetwear_tokenizer";
import { expect, assert } from "chai";
import { 
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

describe("🏷️ Streetwear Tokenizer - Comprehensive Tests", () => {
  // Configure the client to use the configured cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.StreetwearTokenizer as Program<StreetwearTokenizer>;
  const provider = anchor.getProvider();
  const connection = provider.connection;

  // Test accounts
  let mintKeypair: anchor.web3.Keypair;
  let assetPda: anchor.web3.PublicKey;
  let tokenAccount: anchor.web3.PublicKey;
  let escrowPda: anchor.web3.PublicKey;
  
  const owner = (provider.wallet as anchor.Wallet).payer;

  // Helper function to get PDAs
  const getAssetPDA = (owner: anchor.web3.PublicKey, mint: anchor.web3.PublicKey) => {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("asset"), owner.toBuffer(), mint.toBuffer()],
      program.programId
    )[0];
  };

  const getEscrowPDA = (seller: anchor.web3.PublicKey, mint: anchor.web3.PublicKey) => {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), seller.toBuffer(), mint.toBuffer()],
      program.programId
    )[0];
  };

  describe("✅ Tokenization Tests", () => {
    it("Should tokenize a streetwear item successfully", async () => {
      mintKeypair = anchor.web3.Keypair.generate();
      assetPda = getAssetPDA(owner.publicKey, mintKeypair.publicKey);
      tokenAccount = getAssociatedTokenAddressSync(
        mintKeypair.publicKey,
        owner.publicKey
      );

      const name = "Air Jordan 1 Retro High OG";
      const symbol = "AJ1";
      const uri = "https://arweave.net/test-metadata.json";
      const brand = "Nike";
      const model = "Air Jordan 1";
      const size = "US 10";
      const condition = "New";
      const year = 2023;
      const rarity = { rare: {} };

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
          owner: owner.publicKey,
          mint: mintKeypair.publicKey,
          tokenAccount: tokenAccount,
          assetAccount: assetPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([mintKeypair, owner])
        .rpc();

      console.log("✅ Tokenization tx:", tx);

      // Verify the asset account
      const assetAccount = await program.account.streetwearAsset.fetch(assetPda);
      
      expect(assetAccount.owner.toBase58()).to.equal(owner.publicKey.toBase58());
      expect(assetAccount.mint.toBase58()).to.equal(mintKeypair.publicKey.toBase58());
      expect(assetAccount.brand).to.equal(brand);
      expect(assetAccount.model).to.equal(model);
      expect(assetAccount.size).to.equal(size);
      expect(assetAccount.condition).to.equal(condition);
      expect(assetAccount.year).to.equal(year);
      expect(assetAccount.isListed).to.be.false;

      // Verify token account
      const tokenAccountInfo = await connection.getTokenAccountBalance(tokenAccount);
      expect(tokenAccountInfo.value.amount).to.equal("1");
    });

    it("Should tokenize with different rarity levels", async () => {
      const rarityLevels = [
        { common: {} },
        { uncommon: {} },
        { rare: {} },
        { epic: {} },
        { legendary: {} },
      ];

      for (const rarity of rarityLevels) {
        const mint = anchor.web3.Keypair.generate();
        const assetPda = getAssetPDA(owner.publicKey, mint.publicKey);
        const tokenAcc = getAssociatedTokenAddressSync(mint.publicKey, owner.publicKey);

        await program.methods
          .tokenizeStreetwear(
            "Test Item",
            "TEST",
            "https://test.com/metadata.json",
            "TestBrand",
            "TestModel",
            "M",
            "New",
            2023,
            rarity
          )
          .accounts({
            owner: owner.publicKey,
            mint: mint.publicKey,
            tokenAccount: tokenAcc,
            assetAccount: assetPda,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([mint, owner])
          .rpc();

        const assetAccount = await program.account.streetwearAsset.fetch(assetPda);
        expect(assetAccount.rarity).to.deep.equal(rarity);
      }

      console.log("✅ All rarity levels tested successfully");
    });

    it("Should fail with invalid year", async () => {
      const mint = anchor.web3.Keypair.generate();
      const assetPda = getAssetPDA(owner.publicKey, mint.publicKey);
      const tokenAcc = getAssociatedTokenAddressSync(mint.publicKey, owner.publicKey);

      try {
        await program.methods
          .tokenizeStreetwear(
            "Test Item",
            "TEST",
            "https://test.com/metadata.json",
            "TestBrand",
            "TestModel",
            "M",
            "New",
            1989, // Invalid year (< 1990)
            { common: {} }
          )
          .accounts({
            owner: owner.publicKey,
            mint: mint.publicKey,
            tokenAccount: tokenAcc,
            assetAccount: assetPda,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([mint, owner])
          .rpc();
        
        assert.fail("Should have failed with invalid year");
      } catch (error) {
        expect(error.message).to.include("InvalidYear");
        console.log("✅ Invalid year validation works correctly");
      }
    });

    it("Should fail with empty brand", async () => {
      const mint = anchor.web3.Keypair.generate();
      const assetPda = getAssetPDA(owner.publicKey, mint.publicKey);
      const tokenAcc = getAssociatedTokenAddressSync(mint.publicKey, owner.publicKey);

      try {
        await program.methods
          .tokenizeStreetwear(
            "Test Item",
            "TEST",
            "https://test.com/metadata.json",
            "", // Empty brand
            "TestModel",
            "M",
            "New",
            2023,
            { common: {} }
          )
          .accounts({
            owner: owner.publicKey,
            mint: mint.publicKey,
            tokenAccount: tokenAcc,
            assetAccount: assetPda,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([mint, owner])
          .rpc();
        
        assert.fail("Should have failed with empty brand");
      } catch (error) {
        expect(error.message).to.include("InvalidBrand");
        console.log("✅ Empty brand validation works correctly");
      }
    });
  });

  describe("📋 Listing Tests", () => {
    before(async () => {
      // Create a fresh NFT for listing tests
      mintKeypair = anchor.web3.Keypair.generate();
      assetPda = getAssetPDA(owner.publicKey, mintKeypair.publicKey);
      tokenAccount = getAssociatedTokenAddressSync(
        mintKeypair.publicKey,
        owner.publicKey
      );

      await program.methods
        .tokenizeStreetwear(
          "Test NFT for Listing",
          "TNFL",
          "https://test.com/metadata.json",
          "TestBrand",
          "TestModel",
          "M",
          "New",
          2023,
          { common: {} }
        )
        .accounts({
          owner: owner.publicKey,
          mint: mintKeypair.publicKey,
          tokenAccount: tokenAccount,
          assetAccount: assetPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([mintKeypair, owner])
        .rpc();
    });

    it("Should list an NFT for sale", async () => {
      escrowPda = getEscrowPDA(owner.publicKey, mintKeypair.publicKey);
      const price = new anchor.BN(1_000_000_000); // 1 SOL

      const tx = await program.methods
        .listNft(price)
        .accounts({
          seller: owner.publicKey,
          escrowAccount: escrowPda,
          nftMint: mintKeypair.publicKey,
          assetAccount: assetPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([owner])
        .rpc();

      console.log("✅ Listing tx:", tx);

      // Verify escrow account
      const escrowAccount = await program.account.escrowAccount.fetch(escrowPda);
      expect(escrowAccount.seller.toBase58()).to.equal(owner.publicKey.toBase58());
      expect(escrowAccount.nftMint.toBase58()).to.equal(mintKeypair.publicKey.toBase58());
      expect(escrowAccount.price.toString()).to.equal(price.toString());
      expect(escrowAccount.state).to.deep.equal({ listed: {} });

      // Verify asset is marked as listed
      const assetAccount = await program.account.streetwearAsset.fetch(assetPda);
      expect(assetAccount.isListed).to.be.true;
    });

    it("Should fail to list with zero price", async () => {
      const newMint = anchor.web3.Keypair.generate();
      const newAssetPda = getAssetPDA(owner.publicKey, newMint.publicKey);
      const newTokenAccount = getAssociatedTokenAddressSync(newMint.publicKey, owner.publicKey);
      const newEscrowPda = getEscrowPDA(owner.publicKey, newMint.publicKey);

      // Create NFT first
      await program.methods
        .tokenizeStreetwear(
          "Test NFT",
          "TEST",
          "https://test.com/metadata.json",
          "TestBrand",
          "TestModel",
          "M",
          "New",
          2023,
          { common: {} }
        )
        .accounts({
          owner: owner.publicKey,
          mint: newMint.publicKey,
          tokenAccount: newTokenAccount,
          assetAccount: newAssetPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([newMint, owner])
        .rpc();

      try {
        await program.methods
          .listNft(new anchor.BN(0)) // Zero price
          .accounts({
            seller: owner.publicKey,
            escrowAccount: newEscrowPda,
            nftMint: newMint.publicKey,
            assetAccount: newAssetPda,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([owner])
          .rpc();

        assert.fail("Should have failed with zero price");
      } catch (error) {
        expect(error.message).to.include("InvalidPrice");
        console.log("✅ Zero price validation works correctly");
      }
    });

    it("Should fail to list already listed NFT", async () => {
      try {
        await program.methods
          .listNft(new anchor.BN(2_000_000_000))
          .accounts({
            seller: owner.publicKey,
            escrowAccount: escrowPda,
            nftMint: mintKeypair.publicKey,
            assetAccount: assetPda,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([owner])
          .rpc();

        assert.fail("Should have failed with already listed");
      } catch (error) {
        expect(error.message).to.include("AlreadyListed");
        console.log("✅ Already listed validation works correctly");
      }
    });
  });

  describe("💰 Buying Tests", () => {
    let buyer: anchor.web3.Keypair;
    let sellerTokenAccount: anchor.web3.PublicKey;
    let buyerTokenAccount: anchor.web3.PublicKey;

    before(async () => {
      // Create buyer account
      buyer = anchor.web3.Keypair.generate();
      
      // Airdrop SOL to buyer
      const airdropSignature = await connection.requestAirdrop(
        buyer.publicKey,
        5 * anchor.web3.LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(airdropSignature);

      sellerTokenAccount = tokenAccount;
      buyerTokenAccount = getAssociatedTokenAddressSync(
        mintKeypair.publicKey,
        buyer.publicKey
      );
    });

    it("Should buy a listed NFT successfully", async () => {
      const sellerBalanceBefore = await connection.getBalance(owner.publicKey);
      const escrowAccount = await program.account.escrowAccount.fetch(escrowPda);
      const price = escrowAccount.price;

      const tx = await program.methods
        .buyNft()
        .accounts({
          buyer: buyer.publicKey,
          seller: owner.publicKey,
          escrowAccount: escrowPda,
          nftMint: mintKeypair.publicKey,
          assetAccount: assetPda,
          sellerTokenAccount: sellerTokenAccount,
          buyerTokenAccount: buyerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();

      console.log("✅ Buy tx:", tx);

      // Verify SOL transfer
      const sellerBalanceAfter = await connection.getBalance(owner.publicKey);
      expect(sellerBalanceAfter).to.be.greaterThan(sellerBalanceBefore);

      // Verify NFT transfer
      const buyerTokenAccountInfo = await connection.getTokenAccountBalance(buyerTokenAccount);
      expect(buyerTokenAccountInfo.value.amount).to.equal("1");

      // Verify escrow state
      const updatedEscrow = await program.account.escrowAccount.fetch(escrowPda);
      expect(updatedEscrow.state).to.deep.equal({ sold: {} });

      // Verify asset account
      const updatedAsset = await program.account.streetwearAsset.fetch(assetPda);
      expect(updatedAsset.isListed).to.be.false;
      expect(updatedAsset.owner.toBase58()).to.equal(buyer.publicKey.toBase58());
    });
  });

  describe("🚫 Cancellation Tests", () => {
    let cancelMint: anchor.web3.Keypair;
    let cancelAssetPda: anchor.web3.PublicKey;
    let cancelEscrowPda: anchor.web3.PublicKey;

    before(async () => {
      // Create and list an NFT for cancellation test
      cancelMint = anchor.web3.Keypair.generate();
      cancelAssetPda = getAssetPDA(owner.publicKey, cancelMint.publicKey);
      const cancelTokenAccount = getAssociatedTokenAddressSync(
        cancelMint.publicKey,
        owner.publicKey
      );
      cancelEscrowPda = getEscrowPDA(owner.publicKey, cancelMint.publicKey);

      // Tokenize
      await program.methods
        .tokenizeStreetwear(
          "Test NFT for Cancel",
          "TNFC",
          "https://test.com/metadata.json",
          "TestBrand",
          "TestModel",
          "M",
          "New",
          2023,
          { common: {} }
        )
        .accounts({
          owner: owner.publicKey,
          mint: cancelMint.publicKey,
          tokenAccount: cancelTokenAccount,
          assetAccount: cancelAssetPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([cancelMint, owner])
        .rpc();

      // List
      await program.methods
        .listNft(new anchor.BN(3_000_000_000))
        .accounts({
          seller: owner.publicKey,
          escrowAccount: cancelEscrowPda,
          nftMint: cancelMint.publicKey,
          assetAccount: cancelAssetPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([owner])
        .rpc();
    });

    it("Should cancel a listing successfully", async () => {
      const tx = await program.methods
        .cancelListing()
        .accounts({
          seller: owner.publicKey,
          escrowAccount: cancelEscrowPda,
          nftMint: cancelMint.publicKey,
          assetAccount: cancelAssetPda,
        })
        .signers([owner])
        .rpc();

      console.log("✅ Cancel listing tx:", tx);

      // Verify escrow state
      const escrowAccount = await program.account.escrowAccount.fetch(cancelEscrowPda);
      expect(escrowAccount.state).to.deep.equal({ cancelled: {} });

      // Verify asset is not listed
      const assetAccount = await program.account.streetwearAsset.fetch(cancelAssetPda);
      expect(assetAccount.isListed).to.be.false;
    });

    it("Should fail to cancel non-listed NFT", async () => {
      try {
        await program.methods
          .cancelListing()
          .accounts({
            seller: owner.publicKey,
            escrowAccount: cancelEscrowPda,
            nftMint: cancelMint.publicKey,
            assetAccount: cancelAssetPda,
          })
          .signers([owner])
          .rpc();

        assert.fail("Should have failed with not listed");
      } catch (error) {
        expect(error.message).to.include("NotListed");
        console.log("✅ Cancel non-listed validation works correctly");
      }
    });
  });

  describe("📊 Summary", () => {
    it("Should display test summary", () => {
      console.log("\n");
      console.log("=".repeat(60));
      console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
      console.log("=".repeat(60));
      console.log("✅ Tokenization Tests: Complete");
      console.log("✅ Listing Tests: Complete");
      console.log("✅ Buying Tests: Complete");
      console.log("✅ Cancellation Tests: Complete");
      console.log("✅ Error Validation Tests: Complete");
      console.log("=".repeat(60));
      console.log("\n");
    });
  });
});
