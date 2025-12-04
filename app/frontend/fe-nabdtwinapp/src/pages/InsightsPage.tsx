import MainPageHeader from "../components/MainPageHeader.tsx";

function InsightsPage() {
    const title = "Insights";
    const description = "Here are your insights";
    return (
        <div>
            <MainPageHeader title={title} description={description} />
        </div>
    );
}

export default InsightsPage;