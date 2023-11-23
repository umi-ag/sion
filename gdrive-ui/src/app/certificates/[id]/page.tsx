import { Certificate, LineChart, generateRandomData } from '../Certificate';
import { certificates } from '../data';

const Page = ({ params }: { params: { id: string } }) => {
  const cert = certificates.find((certificate) => certificate.id === params.id) as Certificate;
  const graphData = generateRandomData(JSON.stringify(cert), 10, 10, 50);

  return (
    <>
      <h1 className="text-2xl font-bold mb-8">{cert.title}</h1>
      <span>{cert.value}</span>
      <LineChart data={graphData} />
    </>
  );
};

export default Page;
