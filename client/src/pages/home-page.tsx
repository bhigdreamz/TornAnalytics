import MainLayout from "@/components/layouts/MainLayout";
import PlayerStats from "@/components/dashboard/PlayerStats";
import CompanyTracking from "@/components/dashboard/CompanyTracking";
import FactionTracking from "@/components/dashboard/FactionTracking";
import TornBazaar from "@/components/dashboard/TornBazaar";
import EmployeeSearchCard from "@/components/dashboard/EmployeeSearchCard";
import FactionSearchCard from "@/components/dashboard/FactionSearchCard";
import { Helmet } from "react-helmet";
import CompanySearchCard from "@/components/dashboard/CompanySearchCard";
import FactionsSearchCard from "@/components/dashboard/FactionsSearchCard";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Dashboard | Byte-Core Vault</title>
        <meta name="description" content="View your Torn RPG stats, company, faction and bazaar information in one place with Byte-Core Vault." />
      </Helmet>
      <MainLayout title="User Stats Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PlayerStats />
          <CompanyTracking />
          <FactionTracking />
          <TornBazaar />
          <EmployeeSearchCard />
          <FactionSearchCard />
        </div>
      </MainLayout>
    </>
  );
}


const CompanySearchCard = () => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-2">Company Search</h2>
      <p className="text-gray-600">Search for companies in Torn.</p>
      <a href="/company-search" className="inline-block mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Search Companies
      </a>
    </div>
  );
};

export default CompanySearchCard;
```

```jsx
// FactionsSearchCard.jsx
import React from 'react';

const FactionsSearchCard = () => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-2">Faction Search</h2>
      <p className="text-gray-600">Search for factions in Torn.</p>
      <a href="/faction-search" className="inline-block mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Search Factions
      </a>
    </div>
  );
};

export default FactionsSearchCard;
```

```jsx
// FactionSearch.jsx
import MainLayout from "@/components/layouts/MainLayout";
import { Helmet } from "react-helmet";

const FactionSearchPage = () => {
    return (
      <>
        <Helmet>
          <title>Faction Search | Byte-Core Vault</title>
          <meta name="description" content="Search for factions in Torn with Byte-Core Vault." />
        </Helmet>
        <MainLayout title="Faction Search">
          <div>
            <h1>Faction Search</h1>
            <p>This is the faction search page.</p>
            {/* Add your faction search component here */}
          </div>
        </MainLayout>
      </>
    );
  };

  export default FactionSearchPage;
```

```jsx
// CompanySearch.jsx
import MainLayout from "@/components/layouts/MainLayout";
import { Helmet } from "react-helmet";

const CompanySearchPage = () => {
    return (
      <>
        <Helmet>
          <title>Company Search | Byte-Core Vault</title>
          <meta name="description" content="Search for companies in Torn with Byte-Core Vault." />
        </Helmet>
        <MainLayout title="Company Search">
          <div>
            <h1>Company Search</h1>
            <p>This is the company search page.</p>
            {/* Add your company search component here */}
          </div>
        </MainLayout>
      </>
    );
  };

  export default CompanySearchPage;
```

```jsx
import MainLayout from "@/components/layouts/MainLayout";
import PlayerStats from "@/components/dashboard/PlayerStats";
import CompanyTracking from "@/components/dashboard/CompanyTracking";
import FactionTracking from "@/components/dashboard/FactionTracking";
import TornBazaar from "@/components/dashboard/TornBazaar";
import EmployeeSearchCard from "@/components/dashboard/EmployeeSearchCard";
import FactionSearchCard from "@/components/dashboard/FactionSearchCard";
import { Helmet } from "react-helmet";
import CompanySearchCard from "@/components/dashboard/CompanySearchCard";
import FactionsSearchCard from "@/components/dashboard/FactionsSearchCard";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Dashboard | Byte-Core Vault</title>
        <meta name="description" content="View your Torn RPG stats, company, faction and bazaar information in one place with Byte-Core Vault." />
      </Helmet>
      <MainLayout title="User Stats Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PlayerStats />
          <CompanyTracking />
          <FactionTracking />
          <TornBazaar />
          <EmployeeSearchCard />
          <FactionSearchCard />
          <CompanySearchCard />
          <FactionsSearchCard />
        </div>
      </MainLayout>
    </>
  );
}
```

```
// _app.js
import '../styles/globals.css'
import { SessionProvider } from "next-auth/react"

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}

export default MyApp
```

```
// index.js
export default function Home() {
  return (
    <div>
      <h1>Welcome to Byte-Core Vault</h1>
      <p>This is the home page.</p>
    </div>
  );
}
```

```
// _document.js
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

```
// globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Final Answer:
```html
import MainLayout from "@/components/layouts/MainLayout";
import PlayerStats from "@/components/dashboard/PlayerStats";
import CompanyTracking from "@/components/dashboard/CompanyTracking";
import FactionTracking from "@/components/dashboard/FactionTracking";
import TornBazaar from "@/components/dashboard/TornBazaar";
import EmployeeSearchCard from "@/components/dashboard/EmployeeSearchCard";
import FactionSearchCard from "@/components/dashboard/FactionSearchCard";
import { Helmet } from "react-helmet";
import CompanySearchCard from "@/components/dashboard/CompanySearchCard";
import FactionsSearchCard from "@/components/dashboard/FactionsSearchCard";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Dashboard | Byte-Core Vault</title>
        <meta name="description" content="View your Torn RPG stats, company, faction and bazaar information in one place with Byte-Core Vault." />
      </Helmet>
      <MainLayout title="User Stats Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PlayerStats />
          <CompanyTracking />
          <FactionTracking />
          <TornBazaar />
          <EmployeeSearchCard />
          <FactionSearchCard />
          <CompanySearchCard />
          <FactionsSearchCard />
        </div>
      </MainLayout>
    </>
  );
}