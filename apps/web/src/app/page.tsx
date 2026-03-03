import { Button, Card, CardContent, CardHeader, CardTitle } from '@cowri/ui';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center text-3xl">
            Bienvenue sur Cowri
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-center text-muted-foreground">
            La marketplace africaine pour acheter et vendre en toute confiance.
          </p>
          <div className="flex gap-4">
            <Button>Commencer</Button>
            <Button variant="outline">En savoir plus</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
