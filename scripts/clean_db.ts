import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function clean() {
  console.log("Cleaning up old invoice data to allow schema update...")
  try {
    // We must delete items and payments first due to foreign key constraints
    await prisma.invoiceItem.deleteMany()
    console.log("- Deleted Invoice Items")
    
    // We ignore typescript error for payment since it was removed from the new schema 
    // but the generated client might still have it or not. If we use a raw query, it's safer.
    await prisma.$executeRawUnsafe(`DELETE FROM "payments";`).catch(() => {})
    console.log("- Deleted old Payments")

    await prisma.$executeRawUnsafe(`DELETE FROM "invoices";`)
    console.log("- Deleted old Invoices")

    console.log("Success! You can now run `npx prisma db push`")
  } catch (err) {
    console.error("Error during cleanup:", err)
  } finally {
    await prisma.$disconnect()
  }
}

clean()
