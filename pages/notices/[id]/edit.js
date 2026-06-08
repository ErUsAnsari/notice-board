import Layout from "../../../components/Layout";
import NoticeForm from "../../../components/NoticeForm";
import { prisma } from "@/lib/prisma";

export default function EditNoticePage({ notice }) {
  return (
    <Layout title={`Edit: ${notice.title} — Notice Board`}>
      <NoticeForm mode="edit" initial={notice} />
    </Layout>
  );
}


export async function getServerSideProps({ params }) {
  const { id } = params;

  try {
    const notice = await prisma.notice.findUnique({ where: { id } });
    if (!notice) return { notFound: true };

    return {
      props: { notice: JSON.parse(JSON.stringify(notice)) },
    };
  } catch {
    return { notFound: true };
  }
}
