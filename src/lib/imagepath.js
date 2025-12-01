// src/lib/imagepath.js

// This file centralizes all technology icon paths used across your components.
// All paths beginning with '/' are assumed to be relative to the 'public/assets' directory.

export const TechIconMap = {
    // ----------------------------------------------------------------------------------
    // --- MAPPED & CORRECTED TECHNOLOGIES (Based on original file list and desired keys)
    // ----------------------------------------------------------------------------------
    
    // --- Working On (Current) ---
    'Python': '/assets/Python.svg',
    'FastAPI': '/assets/FastAPI.svg',
    'Gen-AI': '/assets/GenAi.webp', 
    "AWS": '/assets/AWS.svg', // Main AWS icon

    // --- Core Web Technologies (Corrected path/casing to match file system) ---
    'Next.js': '/assets/Next.js.svg', // Using 'Next.js.svg' as per file list
    'TypeScript': '/assets/TypeScript.svg', 
    'React': '/assets/React.svg', 
    
    // --- Project Technologies (Mapped to files you likely intended) ---
    'PostgreSQL': '/assets/PostgresSQL.svg', // Corrected from Postgresql.svg
    'Prisma': '/assets/Prisma.svg', // Assuming file exists or will be added
    'Stripe': '/assets/Stripe.svg', // Assuming file exists or will be added
    'Tailwind CSS': '/assets/TailwindCSS.svg', // Assuming file exists or will be added
    'Framer Motion': '/assets/FramerMotion.svg', // Assuming file exists or will be added
    'Storybook': '/assets/Storybook.svg', // Assuming file exists or will be added

    // --- Worked On (Past/External) ---
    'Tableau': '/assets/tableau-icon.svg',
    'Request': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSP3N__OtyeYuuEG3gJR2phvoLi4RDcZLzFVQ&s', 
    'Excel': 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Microsoft_Office_Excel_%282019%E2%80%932025%29.svg',
    'WikiPedia': 'https://en.wikipedia.org/static/images/icons/wikipedia.png', 
    'Word': 'https://upload.wikimedia.org/wikipedia/commons/1/19/Microsoft_Office_Word_%282019%E2%80%932025%29.svg', 
    'Cloud Run': 'https://repository-images.githubusercontent.com/189295422/f294aa00-838c-11e9-8e27-a1fdc651371f', // Assuming file exists or will be added

    // ----------------------------------------------------------------------------------
    // --- REMAINING UNMAPPED ICONS FROM DIRECTORY LISTING (Added and Mapped) ---
    // ----------------------------------------------------------------------------------
    
    // AWS Services
    'AWS CloudWatch': '/assets/aws-cloudwatch.svg',
    'AWS S3': '/assets/aws-s3.svg',
    'AWS Secrets Manager': '/assets/aws-secrets-manager.svg',

    // Languages/Frameworks
    'Bash': '/assets/Bash.svg',
    'Dart': '/assets/Dart.svg',
    'Java': '/assets/Java.svg', // Using one Java variant
    'JavaScript': '/assets/JavaScript.svg',
    'Django REST Framework': '/assets/Django REST.svg',
    'Django Icon': '/assets/django-icon.svg',
    'Django Main': '/assets/Django.svg',
    'Flutter': '/assets/Flutter.svg',
    'Spring': '/assets/spring-icon.svg',

    // Deployment/DevOps/Databases
    'Docker Icon': '/assets/docker-icon.svg',
    'Docker': '/assets/Docker.svg',
    'Kubernetes': '/assets/Kubernetes.svg',
    'Kubernetes Alt': '/assets/kubernetes(1).svg',
    'NGINX': '/assets/NGINX.svg',
    'Node.js': '/assets/Node.js.svg',
    'Podman': '/assets/Podman(4).svg',
    'Vercel': '/assets/vercel-icon.svg',
    'MongoDB': '/assets/MongoDB.svg',

    // Tools/Utilities/OS
    'Crowdin': '/assets/crowdin-dark-symbol.png',
    'ECC': '/assets/ecc.svg',
    'Eclipse': '/assets/eclipse-icon.svg',
    'Git': '/assets/Git.svg',
    'GNOME': '/assets/gnome-icon.svg',
    'Jupyter': '/assets/Jupyter.svg',
    'JWT': '/assets/jwt-icon.svg',
    'Kaggle': '/assets/Kaggle.svg',
    'LaTeX': '/assets/LaTeX.svg',
    'Linux Tux': '/assets/linux-tux.svg',
    'Maven': '/assets/maven.svg',
    'Miro': '/assets/miro-icon.svg',
    'pnpm': '/assets/pnpm.svg',
    'Postman': '/assets/Postman.svg',
    'PyCharm': '/assets/PyCharm.svg',
    'Streamlit': '/assets/Streamlit.svg',
    'TeX': '/assets/TeX.svg',
    'Ubuntu': '/assets/ubuntu.svg',
    'Zapier': '/assets/zapier.svg',
    'AWS EC2':'/assets/ecc.svg',

    // Social/Messaging
    'Discord': '/assets/discord-icon.svg',
    'LinkedIn': '/assets/linkedin-icon.svg',
    'Google Bard': '/assets/google-bard-icon.svg',
    'Gmail': '/assets/google-gmail.svg',
    'X (Twitter)': '/assets/x.svg',
};


// ----------------------------------------------------------------------------------
// --- INDIVIDUAL EXPORTS (Comprehensive List for easy component imports) ---
// ----------------------------------------------------------------------------------

// Primary Tech Exports
export const Python = TechIconMap['Python'];
export const FastAPI = TechIconMap['FastAPI'];
export const GenAI = TechIconMap['Gen-AI']; 
export const AWS = TechIconMap['AWS'];
export const Nextjs = TechIconMap['Next.js'];
export const TypeScript = TechIconMap['TypeScript'];
export const Prisma = TechIconMap['Prisma'];
export const PostgreSQL = TechIconMap['PostgreSQL'];
export const Stripe = TechIconMap['Stripe'];
export const ReactIcon = TechIconMap['React']; 
export const TailwindCSS = TechIconMap['Tailwind CSS'];
export const FramerMotion = TechIconMap['Framer Motion'];
export const Storybook = TechIconMap['Storybook'];

// Past/Utility Exports
export const Request = TechIconMap['Request']; 
export const Tableau = TechIconMap['Tableau'];
export const Excel = TechIconMap['Excel'];
export const WikiExtraction = TechIconMap['Wiki Extraction']; 
export const Word = TechIconMap['Word']; 
export const GoogleCloud = TechIconMap['Google Cloud Run Deployment']; 

// All remaining exported icons for direct import
export const AWSS3 = TechIconMap['AWS S3'];
export const AWSCloudWatch = TechIconMap['AWS CloudWatch'];
export const AWSSecretsManager = TechIconMap['AWS Secrets Manager'];
export const Bash = TechIconMap['Bash'];
export const Dart = TechIconMap['Dart'];
export const Java = TechIconMap['Java'];
export const JavaScript = TechIconMap['JavaScript'];
export const DjangoRESTFramework = TechIconMap['Django REST Framework'];
export const DjangoIcon = TechIconMap['Django Icon'];
export const DjangoMain = TechIconMap['Django Main'];
export const Flutter = TechIconMap['Flutter'];
export const Spring = TechIconMap['Spring'];
export const DockerIcon = TechIconMap['Docker Icon'];
export const Docker = TechIconMap['Docker Main'];
export const Kubernetes = TechIconMap['Kubernetes'];
export const KubernetesAlt = TechIconMap['Kubernetes Alt'];
export const NGINX = TechIconMap['NGINX'];
export const Nodejs = TechIconMap['Node.js'];
export const Podman = TechIconMap['Podman'];
export const Vercel = TechIconMap['Vercel'];
export const MongoDB = TechIconMap['MongoDB'];
export const Crowdin = TechIconMap['Crowdin'];
export const ECC = TechIconMap['ECC'];
export const Eclipse = TechIconMap['Eclipse'];
export const Git = TechIconMap['Git'];
export const GNOME = TechIconMap['GNOME'];
export const Jupyter = TechIconMap['Jupyter'];
export const JWT = TechIconMap['JWT'];
export const Kaggle = TechIconMap['Kaggle'];
export const LaTeX = TechIconMap['LaTeX'];
export const LinuxTux = TechIconMap['Linux Tux'];
export const Maven = TechIconMap['Maven'];
export const Miro = TechIconMap['Miro'];
export const Pnpm = TechIconMap['pnpm'];
export const Postman = TechIconMap['Postman'];
export const PyCharm = TechIconMap['PyCharm'];
export const Streamlit = TechIconMap['Streamlit'];
export const TeX = TechIconMap['TeX'];
export const Ubuntu = TechIconMap['Ubuntu'];
export const Zapier = TechIconMap['Zapier'];
export const Discord = TechIconMap['Discord'];
export const LinkedIn = TechIconMap['LinkedIn'];
export const GoogleBard = TechIconMap['Google Bard'];
export const Gmail = TechIconMap['Gmail'];
export const X = TechIconMap['X (Twitter)'];


// Export for non-tech assets
export const otherAssets = {
    defaultAvatar: '/images/default_avatar.png'
};