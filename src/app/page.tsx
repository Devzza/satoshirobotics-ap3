import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-[url('/satoshirobotics-home.png')] bg-cover bg-center bg-no-repeat grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start bg-white rounded-lg p-12">
        <h1 className="text-black text-[42px] font-bold">Welcome to the Future</h1>
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            Get started by minting your Robot Core now.
          </li>
            <li className="tracking-[-.01em]">
           Claim your capsule starting June 10th to get your Robot Parts.
          </li>
          <li className="tracking-[-.01em]">
            Equip them, save and see your changes instantly onchain.
          </li>
        </ol>

        <div className="bg-blue-200 p-4 rounded-lg">
          <p>We recommend using the desktop version. We're still working on the mobile version for a better experience.</p>
        </div>
<div className="flex flex-row items-center justify-between w-full">
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-lg border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/mint"
            target="_blank"
            rel="noopener noreferrer"
          >
            Go to Mint
          </a>
          <a
            className="rounded-lg border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/profile"
            target="_blank"
            rel="noopener noreferrer"
          >
            Profile
          </a>
        </div>
        <div>
          <a
            className="rounded-lg border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://boredonchain.gitbook.io/satoshi-robotics-docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our Docs
          </a>
        </div>
</div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center bg-black p-4 rounded-lg">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://discord.gg/2YEfWm4dXR"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/discord.svg"
            alt="Discord logo"
            width={16}
            height={16}
          />
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://x.com/satoshirobotics"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/x-logo.svg"
            alt="X logo"
            width={16}
            height={16}
          />
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-white"
          href="https://boredonchain.com"
          target="_blank"
          rel="noopener noreferrer"
        >
         
          boredonchain.com →
        </a>
      </footer>
    </div>
  );
}
