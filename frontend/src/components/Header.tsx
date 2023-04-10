import Link from 'next/link'

const CATEGORIES = [
    'All',
    'Core',
    'Networking',
    'Interface',
    'ERC',
    'Meta',
    'Informational',
]

function Header() {
    return (
        <header className="flex items-center justify-between py-4">
            <div className="max-w-[1216px] mx-auto flex grid-cols-2 flex-col gap-4 px-4 md:grid md:px-12">
                <Link href="/" passHref>
                    <span className="text-xl font-bold text-gray-800">EIPs.wtf</span>
                </Link>
                <nav className="flex-grow">
                    <ul className="flex justify-end space-x-4">
                        {CATEGORIES.map(category => (
                            <li key={category}>
                                <Link href={`/categories/${category.toLowerCase()}`} passHref>
                                    <span className="text-gray-800 hover:text-gray-600" aria-label={`${category} category`}>{category}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </header>
    )
}

export default Header
