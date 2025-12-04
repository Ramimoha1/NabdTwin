
function MainPageHeader({ title, description }: { title: string; description?: string }) {
    return (
        <div className="p-6 w-screen bg-white border-b border-gray-200">
            <h1 className="text-2xl mb-1">{title}</h1>
            <p className="text-gray-600">
                {description}
            </p>
        </div>
        // <div className="h-45 w-screen border border-grey-200 border-b border-1 flex flex-col">
        //     <div>
        //         <p className="flex items-center justify-start mr-4"></p>
        //         {description && (
        //             <p className="text-lg text-gray-600 dark:text-gray-100">
        //
        //             </p>
        //         )}
        //
        //     </div>
        //
        // </div>
    );
}

export default MainPageHeader;
