import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Rozpoczynanie seedingu...");

  const doctorUser1 = await prisma.user.create({
    data: {
      email: "anna.kowalska@med.app",
      name: "dr n. med. Anna Kowalska",
      password: "password123",
      role: "DOCTOR",
      doctorProfile: {
        create: {
          specialty: "Neurolog",
          bio: "Absolwentka Warszawskiego Uniwersytetu Medycznego z 15-letnim doświadczeniem w leczeniu migren i zaburzeń snu.",
        },
      },
    },
  });

  const doctorUser2 = await prisma.user.create({
    data: {
      email: "jan.nowak@med.app",
      name: "lek. Jan Nowak",
      password: "password123",
      role: "DOCTOR",
      doctorProfile: {
        create: {
          specialty: "Neurolog",
          bio: "Doświadczony neurolog z pasją do diagnostyki i leczenia chorób neurodegeneracyjnych.",
        },
      },
    },
  });

  console.log({ doctorUser1, doctorUser2 });
  console.log("Seeding zakończony.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
