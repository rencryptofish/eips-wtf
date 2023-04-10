import { GetServerSideProps, GetServerSidePropsContext } from 'next';

type CategoryProps = {
    category: string;
};

const CategoryPage = ({ category }: CategoryProps) => {
    return <h1>{category}</h1>;
};

export const getServerSideProps: GetServerSideProps<CategoryProps> = async (context: GetServerSidePropsContext) => {
    const { category } = context.query;

    return {
        props: {
            category: category as string,
        },
    };
};

export default CategoryPage;
