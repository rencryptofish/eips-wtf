import Link from 'next/link';

function Footer() {
  return (
    <footer className='flex items-center justify-between py-4 border-t mt-8'>
      <div className='mx-auto flex grid-cols-1 flex-col md:grid md:px-12'>
        <nav className='flex-grow'>
          <ul className='flex justify-end space-x-4'>
            <li>
              <Link href='https://twitter.com/0xren_cf'>
                <span className='text-center'>
                  Maintained by @0xren_cf (dm if you want to chat EIPs)
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
