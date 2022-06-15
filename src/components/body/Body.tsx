import React, { useState } from 'react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import './Body.css'
import ReCAPTCHA from 'react-google-recaptcha'
import { addDoc, collection } from 'firebase/firestore';
import { db, storage } from '../../firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import 'font-awesome/css/font-awesome.min.css';
//@ts-ignore
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const phoneRegExp = /^(\+|\d)[0-9]{7,16}$/;

var imgErr: string;

const linkedInExp = /(https?)?:?(\/\/)?(([w]{3}||\w\w)\.)?linkedin.com(\w+:{0,1}\w*@)?(\S+)(:([0-9])+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

type FormData = {
    resume: string
    fullName: string,
    email: string,
    phone: number,
    currentCompany: string
    linkedInUrl: string
    twitterUrl: string
    gitHubUrl: string
    portfolioUrl: string
    otherWebsiteUrl: string
    preferedPronouns: string
    additionalInformation: string
    gender: string
    race: string
    veteran: string
    captcha: boolean
}

const schema = yup.object().shape({
    fullName: yup.string().required('This is a required field!').max(40, 'Maximum characters exceeded').min(10, 'Name should be atleast of 10 characters'),
    email: yup.string().email().required('This is a required field!'),
    currentCompany: yup.string().notRequired(),
    phone: yup.string().required('This is a required field!').matches(phoneRegExp, 'Phone number is not valid').min(13, 'Country Code Required'),
    resume: yup.mixed()
        .test('fileRequired', 'This is a required field!', function (value) {
            if (value.length == 0) {
                imgErr = 'This is a required field!'
                return false;
            }
            return value.length !== 0
        })
        .test('fileType', 'Only .pdf files are allowed', function (value) {
            const SUPPORTED_FORMATS = ['application/pdf'];
            return SUPPORTED_FORMATS.includes(value[0].type)
        }).test('fileSize', "File Size is too large", value => {
            const sizeInBytes = 5 * 1024 * 1024;//5MB
            return value[0].size <= sizeInBytes;
        }),
    linkedInUrl: yup.string().required('This is a required field!').matches(linkedInExp, 'Invalid LinkedIn Url'),
    twitterUrl: yup.string().url('Invalid URL'),
    gitHubUrl: yup.string().url('Invalid URL'),
    portfolioUrl: yup.string().url('Invalid URL'),
    otherWebsiteUrl: yup.string().url('Invalid URL'),
    preferedPronouns: yup.string().when((val) => {
        if (val) {
            if (val.length > 0) {
                return yup.string().min(30, 'Minimum 30 characters')
            }
            else {
                return yup.string().notRequired();
            }

        } else {
            return yup.string().notRequired();
        }
    }),
    additionalInformation: yup.string().when((val) => {
        if (val) {
            if (val.length > 0) {
                return yup.string().min(30, 'Minimum 30 characters')
            }
            else {
                return yup.string().notRequired();
            }

        } else {
            return yup.string().notRequired();
        }
    }),
    captcha: yup.boolean().oneOf([true], "Verification Required"),
    gender: yup.string().oneOf(['Male', 'Female', 'Decline to self-identify'], 'Please select an option'),
    race: yup.string().oneOf(["Hispanic or Latino", "White (Not Hispanic or Latino)", "Black or African American (Not Hispanic or Latino)", "Native Hawaiian or Other Pacific Islander (Not Hispanic or Latino)", "Asian (Not Hispanic or Latino)", "American Indian or Alaska Native (Not Hispanic or Latino)", "Two or More Races (Not Hispanic or Latino)", "Decline to self-identify"], 'Please select an option'),
    veteran: yup.string().oneOf(["I am a veteran", "I am not a veteran", "Decline to self-identify"], 'Please select an option')
},
    [['preferedPronouns', 'additionalInformation']]
)

function Body() {

    const [captchaValue, setCaptchaValue] = useState(false)
    const [docName, setDocName] = useState(null)
    const [file, setFile] = useState(null)
    const [raceInfo, setRaceInfo] = useState(false)

    var ResumeUrl = ''

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<FormData>({
        resolver: yupResolver(schema)
    })

    const formSubmitHandler: SubmitHandler<FormData> = (async (data) => {
        if (docName == null) return;
        console.log(docName)
        const docRef = ref(storage, `resume/${docName + uuidv4()}`);
        uploadBytes(docRef, docName)
            .then(async (resp) => {
                const url = await getDownloadURL(docRef)
                console.log(url)

                const applicantsData = collection(db, 'applicants-data')
                addDoc(applicantsData, {
                    resume: url,
                    fullName: data.fullName,
                    email: data.email,
                    phone: data.phone,
                    currentCompany: data.currentCompany,
                    linkedInUrl: data.linkedInUrl,
                    twitterUrl: data.twitterUrl,
                    gitHubUrl: data.gitHubUrl,
                    portfolioUrl: data.portfolioUrl,
                    otherWebsiteUrl: data.otherWebsiteUrl,
                    preferedPronouns: data.preferedPronouns,
                    additionalInformation: data.additionalInformation,
                    gender: data.gender,
                    race: data.race,
                    veteran: data.veteran
                }).then(response => alert('Data Saved Successfully!'))
                    .then(() => {
                        reset();
                    })
                    .catch(error => alert(error.message))
            })
        setDocName(null)


        // saving to strapi
        const formData = new FormData();

        formData.append("files", file);
        const upload_res = await axios({
            method: "POST",
            url: "http://localhost:1337/api/upload",
            data: formData
        }).then(({ data }) => {
            ResumeUrl = `http://localhost:1337${data[0].url}`;
            console.log(ResumeUrl)
        }).then(() => {
            const request = new XMLHttpRequest();
            const formData1 = new FormData();
            const sendData = {
                resumeUrl: ResumeUrl,
                fullname: data.fullName,
                email: data.email,
                phone: data.phone,
                currentCompany: data.currentCompany,
                linkedInUrl: data.linkedInUrl,
                twitterUrl: data.twitterUrl,
                gitHubUrl: data.gitHubUrl,
                portfolioUrl: data.portfolioUrl,
                otherWebsiteUrl: data.otherWebsiteUrl,
                preferedPronouns: data.preferedPronouns,
                additionalInformation: data.additionalInformation,
                gender: data.gender,
                race: data.race,
                veteran: data.veteran
            };

            formData1.append("data", JSON.stringify(sendData));
            request.open("POST", "http://localhost:1337/api/applicants-datas");
            request.send(formData1)
            console.log('sent')
        })

    })
    return (
        <div className="section-wrapper" >
            <form onSubmit={handleSubmit(formSubmitHandler)}>
                {/* Section 1 */}
                <div className='section application-form'>
                    <h4>Submit your application</h4>
                    <div className="row field">
                        <label htmlFor="inputResume" className="col-sm-2 col-form-label">Resume/CV<span className="required">✱</span></label>
                        <div className="col-sm-5">
                            <div className="resume-div">
                                <span className="resume-span"><AttachFileIcon className="resume-attach" /></span>
                                <span className="default-label">{docName == null ? 'ATTTACH RESUME/CV' : `${docName}`}</span>
                            </div>
                            <input
                                {...register("resume")}
                                type="file"
                                className="resume form-control"
                                id="inputResume"
                                onChange={(e) => {
                                    setDocName(e.target.files[0].name)
                                    setFile(e.target.files[0])
                                }}
                            />
                            {imgErr && !errors.resume && <span className=' text-danger'>{imgErr}</span>}
                            {errors.resume && <span className=' text-danger'>{errors.resume.message}</span>}
                        </div>
                    </div>
                    <div className="row field">
                        <label htmlFor="inputFullName" className="col-sm-2 col-form-label">Full Name<span className="required">✱</span></label>
                        <div className=" col-sm-8">
                            <input {...register("fullName")} type="text" className="info form-control" id="inputFullName" />
                            {errors.fullName && <span className='text-danger'>{errors.fullName.message}</span>}
                        </div>
                    </div>
                    <div className="row field">
                        <label htmlFor="inputEmail" className="col-sm-2 col-form-label">Email<span className="required">✱</span></label>
                        <div className=" col-sm-8">
                            <input {...register("email")} type="text" className="info form-control" id="inputEmail" />
                            {errors.email && <span className='text-danger'>{errors.email.message}</span>}
                        </div>
                    </div>
                    <div className="row field">
                        <label htmlFor="inputPhone" className="col-sm-2 col-form-label">Phone<span className="required">✱</span></label>
                        <div className=" col-sm-8">
                            <input {...register("phone")} type="text" className="info form-control" id="inputPhone" />
                            {errors.phone && <span className='text-danger'>{errors.phone.message}</span>}
                        </div>
                    </div>
                    <div className="row field">
                        <label htmlFor="inputCompany" className="col-sm-2 col-form-label">Current Company</label>
                        <div className=" col-sm-8">
                            <input {...register("currentCompany")} type="text" className="info form-control" id="inputCompany" />
                            {errors.currentCompany && <span className='text-danger'>{errors.currentCompany.message}</span>}
                        </div>
                    </div>
                </div>

                {/* Section 2 */}
                <div className='section application-form'>
                    <h4>Links</h4>
                    <div className="row field">
                        <label htmlFor="inputLinkedIn" className="col-sm-2 col-form-label">LinkedIn URL<span className="required">✱</span></label>
                        <div className=" col-sm-8">
                            <input {...register("linkedInUrl")} type="text" className="info form-control" id="inputLinkedIn" />
                            {errors.linkedInUrl && <span className='text-danger'>{errors.linkedInUrl.message}</span>}
                        </div>
                    </div>
                    <div className="row field">
                        <label htmlFor="inputTwitter" className="col-sm-2 col-form-label">Twitter URL</label>
                        <div className=" col-sm-8">
                            <input {...register("twitterUrl")} type="text" className="info form-control" id="inputTwitter" />
                            {errors.twitterUrl && <span className='text-danger'>{errors.twitterUrl.message}</span>}
                        </div>
                    </div>
                    <div className="row field">
                        <label htmlFor="inputGitHub" className="col-sm-2 col-form-label">GitHub URL</label>
                        <div className=" col-sm-8">
                            <input {...register("gitHubUrl")} type="text" className="info form-control" id="inputGitHub" />
                            {errors.gitHubUrl && <span className='text-danger'>{errors.gitHubUrl.message}</span>}
                        </div>
                    </div>
                    <div className="row field">
                        <label htmlFor="inputPortfolio" className="col-sm-2 col-form-label">Portfolio URL</label>
                        <div className=" col-sm-8">
                            <input {...register("portfolioUrl")} type="text" className="info form-control" id="inputPortfolio" />
                            {errors.portfolioUrl && <span className='text-danger'>{errors.portfolioUrl.message}</span>}
                        </div>
                    </div>
                    <div className="row field">
                        <label htmlFor="inputOtherWebsite" className="col-sm-2 col-form-label">Other Website</label>
                        <div className=" col-sm-8">
                            <input {...register("otherWebsiteUrl")} type="text" className="info form-control" id="inputOtherWebsite" />
                            {errors.otherWebsiteUrl && <span className='text-danger'>{errors.otherWebsiteUrl.message}</span>}
                        </div>
                    </div>
                </div>


                {/* Section 3 */}
                <div className="section application-form">
                    <h4>Preferred Pronouns</h4>
                    <input {...register("preferedPronouns")} type="text" className="info form-control" id="inputPronouns" placeholder="Type your response" />
                    {errors.preferedPronouns && <span className='text-danger'>{errors.preferedPronouns.message}</span>}

                    <h4>Additional Information</h4>
                    <textarea {...register("additionalInformation")} className="info form-control" placeholder="Add a cover letter or anything else you want to share." id="textAreaAdditional" style={{ height: '100px' }}></textarea>
                    {errors.additionalInformation && <span className='text-danger'>{errors.additionalInformation.message}</span>}
                </div>

                {/* Section 4 */}
                <div className="section application-form">
                    <hr />
                    <h4>U.S. Equal Employment Opportunity information &nbsp; <span className="eeo-light-text">(Completion is voluntary and will not subject you to adverse treatment)</span></h4>
                    <p>Our company values diversity. To ensure that we comply with reporting requirements and to learn more about how we can increase diversity in our candidate pool, we invite you to voluntarily provide demographic information in a confidential survey at the end of this application. Providing this information is optional. It will not be accessible or used in the hiring process, and has no effect on your opportunity for employment.</p>

                    <div className="row field drop-div">
                        <label htmlFor="selectGender" className="col-sm-2 col-form-label">Gender<span className="required">✱</span></label>
                        <select {...register("gender")} name="[gender]" id="selectGender" className=" col-sm-8">
                            <option value="">Select ...</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Decline to self-identify">Decline to self-identify</option>
                        </select>
                    </div>
                    {errors.gender && <span className='drop text-danger'>{errors.gender.message}</span>}

                    <div className="row field drop-div">
                        <label htmlFor="selectRace" className="col-sm-2 col-form-label">Race<span className="required">✱</span><span><i style={{ color: 'white', background: '#72767d', borderRadius: '15px', border: '1px solid #72767d' }} className="fa fa-info-circle mx-3" aria-hidden="true" onClick={() => setRaceInfo(!raceInfo)}></i></span></label>
                        <select {...register("race")} name="[race]" className=" col-sm-8">
                            <option value="">Select ...</option>
                            <option value="Hispanic or Latino">Hispanic or Latino</option>
                            <option value="White (Not Hispanic or Latino)">White (Not Hispanic or Latino)</option>
                            <option value="Black or African American (Not Hispanic or Latino)">Black or African American (Not Hispanic or Latino)</option>
                            <option value="Native Hawaiian or Other Pacific Islander (Not Hispanic or Latino)">Native Hawaiian or Other Pacific Islander (Not Hispanic or Latino)</option>
                            <option value="Asian (Not Hispanic or Latino)">Asian (Not Hispanic or Latino)</option>
                            <option value="American Indian or Alaska Native (Not Hispanic or Latino)">American Indian or Alaska Native (Not Hispanic or Latino)</option><option value="Two or More Races (Not Hispanic or Latino)">Two or More Races (Not Hispanic or Latino)</option>
                            <option value="Decline to self-identify">Decline to self-identify</option>
                        </select>

                    </div>
                    {errors.race && <span className='drop text-danger'>{errors.race.message}</span>}
                    {raceInfo ? <ul>
                        <li>
                            <div>Hispanic or Latino</div>
                            <div className="description">A person of Cuban, Mexican, Puerto Rican, South or Central American, or other Spanish culture or origin regardless of race.
                            </div>
                        </li>
                        <li>
                            <div>White (Not Hispanic or Latino)</div><div className="description">A person having origins in any of the original peoples of Europe, the Middle East, or North Africa.</div>
                        </li>
                        <li>
                            <div>Black or African American (Not Hispanic or Latino)</div><div className="description">A person having origins in any of the black racial groups of Africa.</div></li>
                        <li>
                            <div>Native Hawaiian or Other Pacific Islander (Not Hispanic or Latino)</div><div className="description">A person having origins in any of the peoples of Hawaii, Guam, Samoa, or other Pacific Islands.</div>
                        </li>
                        <li>
                            <div>Asian (Not Hispanic or Latino)</div><div className="description">A person having origins in any of the original peoples of the Far East, Southeast Asia, or the Indian Subcontinent, including, for example, Cambodia, China, India, Japan, Korea, Malaysia, Pakistan, the Philippine Islands, Thailand, and Vietnam.</div>
                        </li>
                        <li>
                            <div>American Indian or Alaska Native (Not Hispanic or Latino)</div><div className="description">A person having origins in any of the original peoples of North and South America (including Central America), and who maintain tribal affiliation or community attachment.</div>
                        </li>
                        <li>
                            <div>Two or More Races (Not Hispanic or Latino)</div><div className="description">All persons who identify with more than one of the above five races.</div>
                        </li>
                    </ul>
                        : null}


                    <div className="row field drop-div">
                        <label htmlFor="selectVeteranStatus" className="col-sm-2 col-form-label" >Veteran Status<span className="required">✱</span></label>
                        <select {...register("veteran")} name="[veteran]" className=" col-sm-8"     >
                            <option value="">Select ...</option>
                            <option value="I am a veteran">I am a veteran</option>
                            <option value="I am not a veteran">I am not a veteran</option>
                            <option value="Decline to self-identify">Decline to self-identify</option>
                        </select>
                    </div>
                    {errors.veteran && <span className='drop text-danger'>{errors.veteran.message}</span>}

                </div>
                <div className="captcha">
                    <ReCAPTCHA
                        className='rcaptcha'
                        sitekey=" 6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                        onChange={(value: any) => {
                            setCaptchaValue(true)
                        }}
                    />
                    <input className='hidden' {...register("captcha")} value={captchaValue.toString()} />
                    <br />
                    {errors.captcha && <span className='text-danger' style={{
                        position: 'relative',
                    }}>{errors.captcha.message}</span>}
                </div>
                <button className="btnsbmt" type="submit">Submit application</button>
            </form>
        </div>
    );
}

export default Body;
