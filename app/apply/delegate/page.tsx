import { Header, Footer, Title } from '@/components/site';
import { ApplicationForm } from '@/components/application-form';

export const metadata = { title: 'Delegate Registration' };

export default function Delegate() {
  return (
    <>
      <Header />
      <main className="container-page pt-36 pb-24">
        <Title
          eyebrow="Delegate registration"
          title="Represent. Negotiate. Lead."
          copy="Complete both steps to submit your candidacy."
        />
        <div className="mt-12">
          <ApplicationForm kind="delegates" />
        </div>
      </main>
      <Footer />
    </>
  );
}
