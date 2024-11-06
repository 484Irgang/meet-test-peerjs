import dynamic from "next/dynamic";

const IndexPage = dynamic(() => import("@/presentation/pages/initial/index"), {
  ssr: false,
});

export default IndexPage;
