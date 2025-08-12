import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@stablecoin-ai.com" },
    update: {},
    create: {
      id: "demo-user",
      email: "demo@stablecoin-ai.com",
    },
  });

  console.log("Created user:", user.email);

  // Create demo contacts
  const john = await prisma.contact.upsert({
    where: { userId_name: { userId: user.id, name: "John" } },
    update: {},
    create: {
      userId: user.id,
      name: "John",
      address: "0x1234567890123456789012345678901234567890",
    },
  });

  const alice = await prisma.contact.upsert({
    where: { userId_name: { userId: user.id, name: "Alice" } },
    update: {},
    create: {
      userId: user.id,
      name: "Alice",
      address: "0x9876543210987654321098765432109876543210",
    },
  });

  console.log("Created contacts:", john.name, alice.name);

  // Create demo wallets
  const baseWallet = await prisma.wallet.upsert({
    where: { userId_chain: { userId: user.id, chain: "base" } },
    update: {},
    create: {
      userId: user.id,
      chain: "base",
      circleUserId: "demo-circle-user",
      circleWalletId: "demo-base-wallet",
      address: "0xabcdef1234567890abcdef1234567890abcdef12",
    },
  });

  const polygonWallet = await prisma.wallet.upsert({
    where: { userId_chain: { userId: user.id, chain: "polygon" } },
    update: {},
    create: {
      userId: user.id,
      chain: "polygon", 
      circleUserId: "demo-circle-user",
      circleWalletId: "demo-polygon-wallet",
      address: "0xfedcba0987654321fedcba0987654321fedcba09",
    },
  });

  console.log("Created wallets:", baseWallet.chain, polygonWallet.chain);

  // Create demo rule
  const rule = await prisma.rule.upsert({
    where: { id: "demo-rule-1" },
    update: {},
    create: {
      id: "demo-rule-1",
      userId: user.id,
      type: "schedule",
      json: {
        type: "schedule",
        asset: "USDC",
        amount: {
          type: "fixed",
          value: 50,
          currency: "USD",
        },
        destination: {
          type: "contact",
          value: "John",
        },
        schedule: {
          cron: "0 8 * * FRI",
          tz: "America/New_York",
        },
        routing: {
          mode: "cheapest",
          allowedChains: ["base", "arbitrum", "polygon", "ethereum"],
        },
        limits: {
          dailyMaxUSD: 200,
          requireConfirmOverUSD: 500,
        },
      },
      status: "ACTIVE",
      nextRunAt: new Date("2024-02-16T13:00:00.000Z"), // Next Friday 8am EST
    },
  });

  console.log("Created rule:", rule.id);

  // Create some demo executions
  const execution1 = await prisma.execution.create({
    data: {
      ruleId: rule.id,
      walletId: baseWallet.id,
      status: "COMPLETED",
      chain: "base",
      feeUsd: 0.05,
      txHash: "0x1234abcd5678ef901234abcd5678ef901234abcd5678ef901234abcd5678ef90",
      idempotencyKey: "demo-exec-1",
    },
  });

  const execution2 = await prisma.execution.create({
    data: {
      ruleId: rule.id,
      status: "PROCESSING",
      chain: "base",
      feeUsd: 0.05,
      idempotencyKey: "demo-exec-2",
    },
  });

  console.log("Created executions:", execution1.id, execution2.id);

  // Create demo quotes
  await prisma.quote.createMany({
    data: [
      {
        ruleId: rule.id,
        chain: "base",
        feeEstimateUsd: 0.05,
        etaSeconds: 10,
        explanation: "Base: Very low fees (~$0.05) on Coinbase L2. USDC transfer takes ~10s.",
      },
      {
        ruleId: rule.id,
        chain: "polygon", 
        feeEstimateUsd: 0.12,
        etaSeconds: 15,
        explanation: "Polygon: Low fees (~$0.12) with good ecosystem. USDC transfer takes ~15s.",
      },
      {
        ruleId: rule.id,
        chain: "arbitrum",
        feeEstimateUsd: 0.18,
        etaSeconds: 5,
        explanation: "Arbitrum One: Low fees (~$0.18) with fast finality. USDC transfer takes ~5s.",
      },
    ],
  });

  console.log("✅ Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });