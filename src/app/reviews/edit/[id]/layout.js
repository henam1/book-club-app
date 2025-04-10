export async function generateStaticParams() {
  return [
    { id: 'placeholder' }  // Minimum one route required for static export
  ];
}

export default function EditLayout({ children }) {
  return <>{children}</>;
}