import * as fs from 'fs';
import * as path from 'path';

const target = process.argv[2] || 'sqlite';
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const envPath = path.join(__dirname, '../.env');

if (target === 'sqlite') {
  console.log('Switching Prisma schema and .env to SQLite for local development...');
  
  const sqliteSchema = `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  phone     String?
  password  String
  role      String   @default("USER") // "USER" | "ADMIN"
  isBanned  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ads       Ad[]
  payments  Payment[]
}

model Category {
  id            String        @id @default(cuid())
  name          String
  slug          String        @unique
  icon          String
  createdAt     DateTime      @default(now())
  subcategories Subcategory[]
  ads           Ad[]
}

model Subcategory {
  id         String   @id @default(cuid())
  name       String
  slug       String   @unique
  icon       String   @default("Tag")
  categoryId String
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  ads        Ad[]
}

model Ad {
  id            String       @id @default(cuid())
  title         String
  description   String
  price         Float
  categoryId    String
  category      Category     @relation(fields: [categoryId], references: [id])
  subcategoryId String?
  subcategory   Subcategory? @relation(fields: [subcategoryId], references: [id])
  userId        String
  user          User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  city          String
  images        String       // JSON stringified array of image URLs
  status        String       @default("PENDING") // "PENDING" | "ACTIVE" | "REJECTED" | "SOLD"
  condition     String       @default("LIKE_NEW") // "NEW" | "LIKE_NEW" | "USED_GOOD" | "NA"
  isFeatured    Boolean      @default(false)
  isUrgent      Boolean      @default(false)
  isNegotiable  Boolean      @default(true)
  views         Int          @default(0)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  reports       Report[]
  payments      Payment[]
}

model Report {
  id            String   @id @default(cuid())
  adId          String
  ad            Ad       @relation(fields: [adId], references: [id], onDelete: Cascade)
  reason        String   // "FRAUD" | "INAPPROPRIATE" | "WRONG_CATEGORY" | "DUPLICATE" | "OTHER"
  details       String?
  reporterName  String?
  reporterPhone String?
  status        String   @default("PENDING") // "PENDING" | "RESOLVED" | "DISMISSED"
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model PlatformSetting {
  key       String   @id
  value     String
  updatedAt DateTime @updatedAt
}

model AdminLog {
  id        String   @id @default(cuid())
  adminName String
  action    String   // "APPROVE_AD" | "REJECT_AD" | "DELETE_AD" | "BAN_USER" | "FEATURE_AD" etc.
  target    String
  details   String?
  createdAt DateTime @default(now())
}

model Payment {
  id            String   @id @default(cuid())
  adId          String
  ad            Ad       @relation(fields: [adId], references: [id], onDelete: Cascade)
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  amount        Float
  currency      String   @default("EGP")
  status        String   @default("PENDING") // "PENDING" | "SUCCESS" | "FAILED"
  paymobOrderId String?
  paymobTxnId   String?
  paymentMethod String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
`;

  fs.writeFileSync(schemaPath, sqliteSchema);
  
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(/DATABASE_URL=.*/, 'DATABASE_URL="file:./dev.db"');
    fs.writeFileSync(envPath, envContent);
  }
  console.log('✓ Successfully configured for SQLite!');
} else {
  console.log('Switching Prisma schema and .env to PostgreSQL...');
  
  const pgSchema = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  USER
  ADMIN
}

enum AdStatus {
  PENDING
  ACTIVE
  REJECTED
  SOLD
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  phone     String?
  password  String
  role      Role     @default(USER)
  isBanned  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ads       Ad[]
  payments  Payment[]
}

model Category {
  id            String        @id @default(cuid())
  name          String
  slug          String        @unique
  icon          String
  createdAt     DateTime      @default(now())
  subcategories Subcategory[]
  ads           Ad[]
}

model Subcategory {
  id         String   @id @default(cuid())
  name       String
  slug       String   @unique
  icon       String   @default("Tag")
  categoryId String
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  ads        Ad[]
}

model Ad {
  id            String       @id @default(cuid())
  title         String
  description   String
  price         Float
  categoryId    String
  category      Category     @relation(fields: [categoryId], references: [id])
  subcategoryId String?
  subcategory   Subcategory? @relation(fields: [subcategoryId], references: [id])
  userId        String
  user          User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  city          String
  images        String[]
  status        AdStatus     @default(PENDING)
  condition     String       @default("LIKE_NEW")
  isFeatured    Boolean      @default(false)
  isUrgent      Boolean      @default(false)
  isNegotiable  Boolean      @default(true)
  views         Int          @default(0)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  reports       Report[]
  payments      Payment[]
}

model Report {
  id            String   @id @default(cuid())
  adId          String
  ad            Ad       @relation(fields: [adId], references: [id], onDelete: Cascade)
  reason        String
  details       String?
  reporterName  String?
  reporterPhone String?
  status        String   @default("PENDING")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model PlatformSetting {
  key       String   @id
  value     String
  updatedAt DateTime @updatedAt
}

model AdminLog {
  id        String   @id @default(cuid())
  adminName String
  action    String
  target    String
  details   String?
  createdAt DateTime @default(now())
}

model Payment {
  id            String   @id @default(cuid())
  adId          String
  ad            Ad       @relation(fields: [adId], references: [id], onDelete: Cascade)
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  amount        Float
  currency      String   @default("EGP")
  status        String   @default("PENDING") // "PENDING" | "SUCCESS" | "FAILED"
  paymobOrderId String?
  paymobTxnId   String?
  paymentMethod String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
`;

  fs.writeFileSync(schemaPath, pgSchema);
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(/DATABASE_URL=.*/, 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/khashala?schema=public"');
    fs.writeFileSync(envPath, envContent);
  }
  console.log('✓ Successfully configured for PostgreSQL!');
}
