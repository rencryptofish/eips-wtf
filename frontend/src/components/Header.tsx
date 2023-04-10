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
            <div className="min-w-[1216px] mx-auto flex grid-cols-2 flex-col md:grid">
                <Link href="/" passHref>
                    <span className="text-xl font-bold text-gray-900">EIPs.wtf</span>
                </Link>
                <nav className="flex-grow">
                    <ul className="flex justify-end space-x-4">
                        {CATEGORIES.map(category => (
                            <li key={category}>
                                <Link href={`/categories/${category.toLowerCase()}`} passHref>
                                    <span className="text-xl text-gray-800 hover:text-gray-600" aria-label={`${category} category`}>{category}</span>
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
