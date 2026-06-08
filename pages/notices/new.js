import Layout from "../../components/Layout";
import NoticeForm from "../../components/NoticeForm";

export default function NewNoticePage() {
    return (
        <Layout title="New Notice — Notice Board">
            <NoticeForm mode="create" />
        </Layout>
    );
}
