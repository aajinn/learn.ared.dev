import { Button, Card, CardBody } from '@heroui/react';

export default function Home() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Learn From Ared - Course Platform</h1>
      
      <Card className="max-w-md">
        <CardBody>
          <h2 className="text-xl font-semibold mb-4">Setup Complete!</h2>
          <p className="mb-4">
            The project dependencies and configuration have been successfully set up:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-1">
            <li>Firebase SDK configured</li>
            <li>HeroUI components ready</li>
            <li>Razorpay integration prepared</li>
            <li>TypeScript types defined</li>
          </ul>
          <Button color="primary">
            Get Started
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
