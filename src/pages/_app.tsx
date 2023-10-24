import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { ManagedUIContext } from '@contexts/ui.context';
import ManagedModal from '@components/common/modal/managed-modal';
import ManagedDrawer from '@components/common/drawer/managed-drawer';
import { useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Hydrate } from 'react-query/hydration';
import { ToastContainer } from 'react-toastify';
import { ReactQueryDevtools } from 'react-query/devtools';
import { appWithTranslation } from 'next-i18next';
import { DefaultSeo } from '@components/seo/default-seo';

// external
import 'react-toastify/dist/ReactToastify.css';

// base css file
import '@styles/scrollbar.css';
import '@styles/swiper-carousel.css';
import '@styles/custom-plugins.css';
import '@styles/tailwind.css';
import { getDirection } from '@utils/get-direction';
import useWindowSize from '@utils/use-window-size';

const Noop: React.FC = ({ children }) => <>{children}</>;

const CustomApp = ({ Component, pageProps }: AppProps) => {
  const queryClientRef = useRef<any>();
  const { width } = useWindowSize();

  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }
  const router = useRouter();
  const dir = getDirection(router.locale);
  useEffect(() => {
    document.documentElement.dir = dir;
  }, [dir]);
  const Layout = (Component as any).Layout || Noop;

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <Hydrate state={pageProps.dehydratedState}>
        <ManagedUIContext>
          <>
            <DefaultSeo />
            <Layout pageProps={pageProps}>
              <Component {...pageProps} key={router.route} />
            </Layout>
            <ToastContainer
              progressClassName="fancy-progress-bar"
              position={width! > 768 ? 'bottom-right' : 'top-right'}
              autoClose={1500}
              hideProgressBar={false}
              closeOnClick={true}
              pauseOnHover={true}
              draggable={true}
            />
            <ManagedModal />
            <ManagedDrawer />
          </>
        </ManagedUIContext>
      </Hydrate>
      {/* <ReactQueryDevtools /> */}
    </QueryClientProvider>
  );
};

export default appWithTranslation(CustomApp);
