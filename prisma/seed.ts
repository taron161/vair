import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const demoPhotos = [
    { url: '/photo/photo-1.jpg', caption: 'Золотой закат' },
    { url: '/photo/photo-2.jpg', caption: 'Утренний город' },
    { url: '/photo/photo-3.jpg', caption: 'Лесная тропа' },
    { url: '/photo/photo-4.jpg', caption: 'Морской бриз' },
    { url: '/photo/photo-5.jpg', caption: 'Ночные огни' },
  ] 

  for (const photo of demoPhotos) {
    await prisma.photo.create({ data: photo })
  }

  console.log('🌱 Демо-фото добавлены!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())