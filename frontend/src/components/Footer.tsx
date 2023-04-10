import Link from 'next/link'

function Footer() {
    return (
        <footer className="flex items-center justify-between py-4 border-t">
            <div className="max-w-[1216px] mx-auto flex grid-cols-1 flex-col md:grid md:px-12">
                <nav className="flex flex-col justify-center">
                    <ul className="flex justify-start flex-wrap space-x-4">
                        <li>
                            <Link href="https://twitter.com/0xren_cf">
                                <span className="text-center">Maintained by @0xren_cf (dm if you want to chat EIPs)</span>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </footer>
    )
}

export default Footer
