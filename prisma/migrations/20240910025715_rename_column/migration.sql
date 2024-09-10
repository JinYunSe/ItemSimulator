-- CreateTable
CREATE TABLE `Users` (
    `userId` INTEGER NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `nickName` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Users_nickName_key`(`nickName`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserInfos` (
    `userInfoId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `nickName` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `UserInfos_userId_key`(`userId`),
    PRIMARY KEY (`userInfoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserInfos` ADD CONSTRAINT `UserInfos_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
