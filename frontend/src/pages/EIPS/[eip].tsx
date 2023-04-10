import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

export const getServerSideProps = async (
    context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<unknown>> => {
    const { eip } = context.params || {};

    if (typeof eip === 'string') {
        const eipUrl = `https://eips.ethereum.org/EIPS/eip-${eip}`;
        return {
            redirect: {
                destination: eipUrl,
                permanent: false,
            },
        };
    }

    return {
        notFound: true,
    };
};

export default function EIPPage() {
    return null;
}
