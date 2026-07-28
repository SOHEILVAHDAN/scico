import { useState } from 'react';
import Globe from 'react-globe.gl';

import Button from '../components/Button.jsx';
import { studioContact } from '../constants/index.js';
import { useLanguage } from '../i18n/index.js';

const About = () => {
  const [hasCopied, setHasCopied] = useState(false);
  const { t } = useLanguage();

  const handleCopy = () => {
    navigator.clipboard.writeText(studioContact.email);
    setHasCopied(true);

    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };

  return (
    <section className="c-space my-20" id="about">
      <div className="grid xl:grid-cols-3 xl:grid-rows-6 md:grid-cols-2 grid-cols-1 gap-5 h-full">
        <div className="col-span-1 xl:row-span-3">
          <div className="grid-container">
            <img src="/assets/grid1.png" alt="" aria-hidden="true" className="w-full sm:h-[276px] h-fit object-contain" />

            <div>
              <p className="grid-headtext">{t.about.intro.title}</p>
              <p className="grid-subtext">{t.about.intro.text}</p>
            </div>
          </div>
        </div>

        <div className="col-span-1 xl:row-span-3">
          <div className="grid-container">
            <img src="/assets/grid2.png" alt="" aria-hidden="true" className="w-full sm:h-[276px] h-fit object-contain" />

            <div>
              <p className="grid-headtext">{t.about.stack.title}</p>
              <p className="grid-subtext">{t.about.stack.text}</p>
            </div>
          </div>
        </div>

        <div className="col-span-1 xl:row-span-4">
          <div className="grid-container">
            <div className="rounded-3xl w-full sm:h-[326px] h-fit flex justify-center items-center">
              <Globe
                height={326}
                width={326}
                backgroundColor="rgba(0, 0, 0, 0)"
                backgroundImageOpacity={0.5}
                showAtmosphere
                showGraticules
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                labelsData={[
                  {
                    lat: studioContact.location.lat,
                    lng: studioContact.location.lng,
                    text: t.about.globe.label,
                    color: 'white',
                    size: 15,
                  },
                ]}
              />
            </div>
            <div>
              <p className="grid-headtext">{t.about.globe.title}</p>
              <p className="grid-subtext">{t.about.globe.text}</p>
              <a href="#contact">
                <Button name={t.about.globe.cta} isBeam containerClass="w-full mt-10" />
              </a>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 xl:row-span-3">
          <div className="grid-container">
            <img src="/assets/grid3.png" alt="" aria-hidden="true" className="w-full sm:h-[266px] h-fit object-contain" />

            <div>
              <p className="grid-headtext">{t.about.passion.title}</p>
              <p className="grid-subtext">{t.about.passion.text}</p>
            </div>
          </div>
        </div>

        <div className="xl:col-span-1 xl:row-span-2">
          <div className="grid-container">
            <img
              src="/assets/grid4.png"
              alt=""
              aria-hidden="true"
              className="w-full md:h-[126px] sm:h-[276px] h-fit object-cover sm:object-top"
            />

            <div className="space-y-2">
              <p className="grid-subtext text-center">{t.about.contact.label}</p>
              <button type="button" className="copy-container" onClick={handleCopy}>
                <img src={hasCopied ? '/assets/tick.svg' : '/assets/copy.svg'} alt="" aria-hidden="true" />
                <p className="lg:text-2xl md:text-xl font-medium text-gray_gradient text-white" dir="ltr">
                  {studioContact.email}
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
