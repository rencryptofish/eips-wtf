import {CategoryPage, CategoryProps } from '../../components/CategoryViz';
import { GetStaticPaths, GetStaticProps } from 'next';
import {
    getLatestEIPDiffsWithCommitsByCategory,
    getEIPByCategoryByStatus,
    getEIPDiffsPerMonthByCategory,
} from '@/utils/api';
import { EIP_CATEGORIES } from '@/utils/constants';



export const getStaticProps: GetStaticProps<CategoryProps> = async (context) => {
    if (!context.params) {
        return {
            notFound: true,
        };
    }

    const { category } = context.params;

    const eipDiffs = await getLatestEIPDiffsWithCommitsByCategory(category as string);
    const eipDiffsPerMonth = await getEIPDiffsPerMonthByCategory(category as string);
    const lastCallEIPs = await getEIPByCategoryByStatus(category as string, 'Last Call');

    return {
        props: {
            category: category as string,
            eipDiffs,
            eipDiffsPerMonth,
            lastCallEIPs,
        },
        revalidate: 60, // Revalidate every minute (optional)
    };
};

export const getStaticPaths: GetStaticPaths = async () => {
    const paths = EIP_CATEGORIES.map((category) => ({
        params: { category: category.toLowerCase() },
    }));


    return {
        paths,
        fallback: false,
    };
};

export default CategoryPage;
