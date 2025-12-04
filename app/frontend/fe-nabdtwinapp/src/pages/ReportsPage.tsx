import MainPageHeader from "../components/MainPageHeader.tsx";

function ReportsPage() {
    const title = "Reports";
    const description = "Here are your reports";
    return (
        <div>
            <MainPageHeader title={title} description={description} />
        </div>
    );
}

export default ReportsPage;