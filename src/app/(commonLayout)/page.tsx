import Head from "next/head";
import { ThemeHero } from "@/components/modules/home/ThemeHero";
import { ThemeServices } from "@/components/modules/home/ThemeServices";
import { ThemeVehicleModels } from "@/components/modules/home/ThemeVehicleModels";
import { ThemeAbout } from "@/components/modules/home/ThemeAbout";
import { ThemeTestimonials } from "@/components/modules/home/ThemeTestimonials";

export default function Home() {
  return (
    <>
      <Head>
        <title>Jatra - Smart Vehicle Rental & Service Platform</title>
        <meta
          name="description"
          content="Jatra is your premium platform for vehicle rentals, professional maintenance, and on-demand emergency assistance."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <ThemeHero />
        <ThemeVehicleModels />
        <ThemeServices />
        <ThemeAbout />
        <ThemeTestimonials />
      </div>
    </>
  );
}
