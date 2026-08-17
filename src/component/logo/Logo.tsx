import Image from "next/image";
import Link from "next/link";;
import BazarBondLogo from "../../assets/BazarBound.png";

const Logo = () => {
    return (
        <div>
            <Link href='/'>
                <Image src={BazarBondLogo || null} alt="BazarBond" className="w-10 h-10 md:w-[55px] md:h-[55px] md:mr-16" />
            </Link>
        </div>
    );
};

export default Logo;
