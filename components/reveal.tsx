'use client';
import {motion} from 'framer-motion';
export function Reveal({children,delay=0}:{children:React.ReactNode;delay?:number}){return <motion.div initial={{opacity:0,y:22}} animate={{opacity:1,y:0}} transition={{duration:.7,delay,ease:[.22,1,.36,1]}}>{children}</motion.div>}
