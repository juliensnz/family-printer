import {getPrinters} from '@/app/actions/printers';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import {LogoutButton} from '@/components/LogoutButton';
import {getI18n} from '@/locales/server';

const Home = async () => {
  const printers = await getPrinters();
  const t = await getI18n();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('welcome')}</h1>
        <LogoutButton />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {printers.map(printer => (
          <Card key={printer.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">{printer.name}</CardTitle>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Home;
