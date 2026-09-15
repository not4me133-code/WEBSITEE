import { ArrowUpRight } from 'lucide-react';

const Brand = ({ onClick, light = false }) => {
  return (
    <button type="button" onClick={onClick} aria-label="ApexPrep home" className={`inline-flex shrink-0 items-center gap-2.5 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${light ? 'text-white' : 'text-foreground'}`}>
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${light ? 'bg-lime text-forest' : 'bg-primary text-primary-foreground'}`}><ArrowUpRight strokeWidth={3} className="h-6 w-6" /></span>
      <span className="text-[23px] font-semibold tracking-[-1px]">apex<span className="font-normal">prep</span><span className={light ? 'text-lime' : 'text-primary'}>.</span></span>
    </button>
  );
};

export default Brand;
