// Import axios
import axios, { AxiosResponse } from 'axios';
// Import key and appId 
import { key, appId } from './adzunak';
// Import MBK
import { mbk } from './mbk';
// Map Box
let zoom: number = 8;

// Map Image
function imageUrl(lng: number, lat: number, zoom: number, mbk: string): string {
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${lng},${lat},${zoom},0/300x200@2x?access_token=${mbk}`;
};

// County
let country: string = 'gb';
// let country: string = 'it';
// Results per page
let res_per_page: number = 100;
// Count
let count: number = 0;

interface Job {
    title: string;
    description: string;
    company: {
        display_name: string;
    };
    location: {
        display_name: string;
    };
    category: {
        label: string;
    };
    contract_type: string;
    created: string;
    latitude: number;
    longitude: number;
    redirect_url: string;
    salary_min: number;
    salary_max: number;
}


// Search job function
const searchJobFn = async (job: string, city: string): Promise<void> => {

    try {
        // Reset view
        let resultsDiv = document.querySelector('.results') as HTMLDivElement;
        resultsDiv.innerHTML = '';
        // Loading
        let loading = document.querySelector('.loading') as HTMLDivElement;
        loading.classList.add('active');

        // URL
        let url: string = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${key}&results_per_page=${res_per_page}&what=${job}&where=${city}&sort_by=date&content-type=application/json`;


        let response: AxiosResponse = await axios.get(url);
        console.log(response);
        count = response.data.count;
        let jobs: Job[] = response.data.results;

        // IMAGE LNG LAT URL
        let imageLink: string = '';
        if(jobs[0].longitude && jobs[0].latitude){
            imageLink = imageUrl(jobs[0].longitude, jobs[0].latitude, zoom, mbk);
        }else{
            imageLink = './imgs/placeholder280x160.png';
        };
        
        console.log(imageLink);

        // Add jobs to the DOM
        resultsDiv.innerHTML = `
        <div class='job-count'><strong>Results: </strong> ${count} results found.</div>
        <div>
        ${jobs.map(job => {

            let now: Date = new Date();
            let tenDaysAgo: Date = new Date(now.setDate(now.getDate() - 10));
            let jobDate: Date = new Date(job.created);

            // console.log(job.created);

            if (jobDate.getTime() > tenDaysAgo.getTime()) {
                return `
                <div class='job-card'>
                    <h2 class='job-title'>${job.title}</h2>
                    <div class='job-created'><strong>Created: </strong> ${new Date(job.created).toLocaleDateString('it')}</div>
                    <div class='job-desc'><strong>Desc: </strong> ${job.description}</div>
                    <div class='job-grid'>
                            <div class='job-left'>
                                <div class='job-comp'><strong>Company: </strong> ${job.company.display_name}</div>
                                <div class='job-location'><strong>Location: </strong> ${job.location.display_name}</div>
                                <div class='job-cat'><strong>Category: </strong> ${job.category.label}</div>
                                <div class='job-contract'><strong>Contract: </strong> ${job.contract_type}</div>
                                <div class='job-sal'><strong>Min-Max: </strong> ${job.salary_min} - ${job.salary_max}</div>
                                <div class='job-link'><a href='${job.redirect_url}' target='blank'>Apply</a></div>
                            </div>
                            <div class='job-right job-map'>
                                <img loading="lazy" src=${imageLink} alt="Map">
                            </div>
                    </div>
                </div>
            `;
            }

        }).join('')

            }
    </div>
    `;

    } catch (error: any) {
        if (error?.message) {
            console.log(error.message);
            alert(error.message);
        }
    } finally {
        let loading = document.querySelector('.loading') as HTMLDivElement;
        loading.classList.remove('active');
        showCards();
    }
};

// Form search event listener
let formSearch = document.querySelector('form') as HTMLFormElement;

formSearch.addEventListener('submit', (e: Event): void => {
    e.preventDefault();
    let jobInput = document.querySelector('.input-job') as HTMLInputElement;
    let cityInput = document.querySelector('.input-city') as HTMLInputElement;
    let job: string = jobInput.value;
    let city: string = cityInput.value;
    // Search
    searchJobFn(job, city);
    // Reset
    formSearch.reset();
});

// TRANSLATE EFFECT
function showCards(): void {

    let cards = document.querySelectorAll('.job-card') as NodeListOf<HTMLDivElement>;

    cards.forEach(card => {

        let options: IntersectionObserverInit = {
            rootMargin: '0px',
            threshold: 0.1
        };
        // Callback function
        function cb<IntersectionObserverCallback>(entries: IntersectionObserverEntry[]): void {
            // console.log(entries);
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // console.log(entry.isIntersecting);
                    entry.target.classList.add('show');
                } else {
                    entry.target.classList.remove('show');
                }
            });
        };
        // Observer
        const observer = new IntersectionObserver(cb, options);
        observer.observe(card);

    });
};

// Scroll top 
let lastScrollValue: number = 0;
let cont = document.querySelector('.container') as HTMLDivElement;
let form = document.querySelector('form') as HTMLFormElement;

cont.onscroll = ((e: Event): void => {
    const target = e.target as HTMLDivElement;
    if (target) {
        let scrollTop = target?.scrollTop;
        // console.log(target?.scrollTop);
        if (scrollTop > lastScrollValue) {
            // console.log('Scolling Down');
            form.classList.add('hide');
        } else {
            form.classList.remove('hide');
        };
        lastScrollValue = scrollTop <= 0 ? 0 : Number(scrollTop);
    }
});
