interface PageHeaderProps {
    headerTitle: string;
    headerDescription?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ headerTitle, headerDescription }) => {
    return (
        <div className="flex flex-wrap items-center justify-between">
            <div className="flex flex-col">
                <p className="text-[18px] font-bold text-[#212B36]">{headerTitle}</p>
                {headerDescription && <p className="text-[14px] text-[#646b72]">{headerDescription}</p>}
            </div>
        </div>
    )
}

export default PageHeader;
