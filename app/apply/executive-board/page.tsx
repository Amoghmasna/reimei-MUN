import { Header, Footer, Title } from '@/components/site';
import { ApplicationForm } from '@/components/application-form';

export const metadata = { title: 'Executive Board Registration' };

export default function ExecutiveBoard() {
  return (
    <>
      <Header />
      <main className="container-page pt-36 pb-24">
        <Title eyebrow="Executive Board registration" title="Guide the conversation." />
        <div className="mt-12">
          <ApplicationForm kind="executive_board" />
        </div>
      </main>
      <Footer />
    </>
  );
}
