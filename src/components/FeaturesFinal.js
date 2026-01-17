import Image from "next/image";
import calendarIcon from "../../public/depths/image1d.png";
import styles from './FeaturesFinal.module.css';
import Link from "next/link";

export default function FeaturesFinal() {
    return (
        <>
            <div className={styles.outer} id="services">

                <div className={styles.container2}>
                    <div className={styles.innercontainer2}>

                        <div className={styles.featureBox2}>
                            <button className={styles.btn}>

                                <Link href="https://test-dases.vercel.app/">
                                    <span className={styles.text}>View a Demo</span>
                                </Link>
                                <span className={styles.divider}></span>
                                <Image
                                    src={calendarIcon}
                                    alt="Calendar"
                                    className={styles.icon}
                                    width={26}
                                    height={26}
                                />
                            </button>
                        </div>

                        <div className={styles.featureBox2}>
                            <h2>Intelligent Automation, Real Results. Intelligent Automation for Real Results That Drive Your Teaching Forward</h2>
                        </div>

                        <div className={styles.featureBox2}>
                            <button className={styles.btn}>
                                <Link href="#bookDemo">
                                    <span className={styles.text}>Request Access</span>
                                </Link>


                                <span className={styles.divider}></span>
                                <Image
                                    src={calendarIcon}
                                    alt="Calendar"
                                    className={styles.icon}
                                    width={26}
                                    height={26}
                                />
                            </button>
                        </div>

                    </div>
                </div>

                <div className={styles.container}>
                    <div className={styles.innercontainer}>

                        <div className={styles.featureBox1}>
                            <h2>Handwriting to Meaning</h2>
                            <p>Convert handwritten responses into structured understanding for accurate, rubric-based evaluation using AI vision.</p>
                        </div>

                        <div className={styles.featureBox1}>
                            <h2>LLM-Driven Rubrics</h2>
                            <p>Automatically generate objective, structured rubrics to ensure consistent, fair evaluation every time.</p>
                        </div>

                        <div className={styles.featureBox1}>
                            <h2>Transparent, Detailed Feedback</h2>
                            <p>Go beyond a score — get question-level insights, rubric-based feedback, and professional student performance reports.</p>
                        </div>

                        <div className={styles.featureBox1}>
                            <h2>Massive Time Savings</h2>
                            <p>Cut evaluation time dramatically so faculty can focus on teaching, not paperwork.</p>
                        </div>

                    </div>
                </div>

            </div>
        </>
    )
}
