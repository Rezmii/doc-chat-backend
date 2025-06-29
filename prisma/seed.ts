// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Rozpoczynanie seedingu...");

  // KROK 1: Czyszczenie istniejących danych
  console.log("Czyszczenie bazy danych...");
  await prisma.review.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.user.deleteMany();

  // KROK 2: Dodawanie nowych lekarzy
  console.log("Dodawanie nowych lekarzy...");

  // --- LEKARZE RODZINNI ---
  await prisma.user.create({
    data: {
      email: "tomasz.kowalczyk@med.app",
      name: "lek. Tomasz Kowalczyk",
      password: "password123",
      role: "DOCTOR",
      doctorProfile: {
        create: {
          specialty: "Lekarz Rodzinny",
          bio: "Lekarz pierwszego kontaktu z 10-letnim doświadczeniem. Zapewnia kompleksową opiekę pacjentom w każdym wieku.",
          photoUrl:
            "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1887&auto=format&fit=crop",
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "ewa.dabrowska@med.app",
      name: "lek. Ewa Dąbrowska",
      password: "password123",
      role: "DOCTOR",
      doctorProfile: {
        create: {
          specialty: "Lekarz Rodzinny",
          bio: "Specjalizuje się w profilaktyce zdrowotnej i prowadzeniu pacjentów z chorobami przewlekłymi.",
          photoUrl:
            "https://images.unsplash.com/photo-1582750421881-22d71a9385a5?q=80&w=1887&auto=format&fit=crop",
        },
      },
    },
  });

  // --- NEUROLOGOWIE ---
  await prisma.user.create({
    data: {
      email: "anna.kowalska@med.app",
      name: "dr n. med. Anna Kowalska",
      password: "password123",
      role: "DOCTOR",
      doctorProfile: {
        create: {
          specialty: "Neurolog",
          bio: "Absolwentka Warszawskiego Uniwersytetu Medycznego z 15-letnim doświadczeniem w leczeniu migren i zaburzeń snu.",
          photoUrl:
            "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop",
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "jan.nowak@med.app",
      name: "lek. Jan Nowak",
      password: "password123",
      role: "DOCTOR",
      doctorProfile: {
        create: {
          specialty: "Neurolog",
          bio: "Doświadczony neurolog z pasją do diagnostyki i leczenia chorób neurodegeneracyjnych, takich jak choroba Parkinsona.",
          photoUrl:
            "https://images.unsplash.com/photo-1537368910025-70035079f52d?q=80&w=1925&auto=format&fit=crop",
        },
      },
    },
  });

  // --- KARDIOLODZY ---
  await prisma.user.create({
    data: {
      email: "piotr.zielinski@med.app",
      name: "prof. dr hab. Piotr Zieliński",
      password: "password123",
      role: "DOCTOR",
      doctorProfile: {
        create: {
          specialty: "Kardiolog",
          bio: "Kierownik Kliniki Kardiologii. Specjalizuje się w leczeniu nadciśnienia tętniczego i choroby wieńcowej.",
          photoUrl:
            "https://images.unsplash.com/photo-1576091160399-112BA7d25d1d?q=80&w=2070&auto=format&fit=crop",
        },
      },
    },
  });

  // --- DERMATOLODZY ---
  await prisma.user.create({
    data: {
      email: "maria.wisniewska@med.app",
      name: "dr Maria Wiśniewska",
      password: "password123",
      role: "DOCTOR",
      doctorProfile: {
        create: {
          specialty: "Dermatolog",
          bio: "Ekspert w dziedzinie dermatologii estetycznej oraz leczenia trądziku i chorób alergicznych skóry.",
          photoUrl:
            "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964&auto=format&fit=crop",
        },
      },
    },
  });

  console.log("Seeding zakończony pomyślnie.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
