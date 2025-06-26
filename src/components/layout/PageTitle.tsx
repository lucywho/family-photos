export function PageTitle({ pageTitle }: { pageTitle: string }) {
  return (
    <div className='sr-only md:not-sr-only'>
      <div className='text-center text-lg bg-primary text-text font-bold py-2 rounded-b-2xl mb-1'>
        {pageTitle}
      </div>
    </div>
  );
}
