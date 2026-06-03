import unicodedata
import re

counties = [
    {"Cluj": ["Cluj-Napoca", "Cluj", "Floresti", "Turda", "Campia Turzii", "Dej", "Gherla", "Huedin", "Apahida", "Baciu", "Bontida", "Jucu", "Gilau", "Aiton", "Aghiresu", "Alunis", "Aschileu", "Baisoara", "Belis", "Bobalna", "Borsa", "Buza", "Calarasi", "Capusu Mare", "Caseiu", "Catina", "Calatele", "Ceanu Mare", "Chinteni", "Chiuiesi", "Ciucea", "Ciurila", "Cojocna", "Cornesti", "Cuzdrioara", "Dabaca", "Feleacu", "Fizesu Gherlii", "Frata", "Garbau", "Geaca", "Iara", "Ichimeni", "Iclod", "Izvoru Crisului", "Margau", "Manastireni", "Mihai Viteazu", "Mica", "Mintiu Gherlii", "Mociu", "Moldovenesti", "Palatca", "Panticeu", "Petrestii de Jos", "Ploscos", "Poieni", "Recea Cristur", "Risca", "Sacuieu", "Savaadisla", "Someseni", "Sopor", "Stiucani", "Sendresti", "Suatu", "Taga", "Tritenii de Jos", "Tureni", "Unguras", "Vad", "Valea Ierii", "Viisoara", "Vultureni"]},
    {"Iasi": ["Iasi", "Iasi", "Pascani", "Targu Frumos", "Harlau", "Belcesti", "Bivolari", "Branesti", "Cotnari", "Cozmesti", "Dobrovat", "Golaesti", "Golaiesti", "Horlesti", "Lespezi", "Lungani", "Madarjac", "Miroslava", "Miroslovesti", "Mogosesti", "Mogosesti-Siret", "Mosna", "Motca", "Movileni", "Oteleni", "Plugari", "Podu Iloaiei", "Popesti", "Popricani", "Prisacani", "Probota", "Raducaneni", "Rediu", "Romanesti", "Ruginoasa", "Scanteia", "Scheia", "Schitu-Duca", "Sipote", "Siretel", "Stolniceni-Prajescu", "Strunga", "Tansoaia", "Tatarusi", "Tibana", "Tibanesti", "Tiganasi", "Todiresti", "Tomesti", "Trifesti", "Tutora", "Ungheni", "Valea Seaca", "Vulturesti", "Erbiceni", "Alexandru I. Cuza", "Andrieseni", "Aroneanu", "Baltati", "Barnova", "Ciortesti", "Ciurea", "Comarna", "Costesti", "Cucuteni", "Dagata", "Deleni", "Dobesti", "Dumesti", "Focuri", "Grajduri", "Grozesti", "Gropnita", "Halucesti", "Harmaneasa", "Helegiu", "Harmanesti", "Helesteni", "Icuseu", "Ipatele", "Lunca", "Mircesti", "Mogosesti", "Osoi", "Padureni", "Parpaul", "Parhauti", "Plopi", "Podu Iloaiei", "Popricani", "Scanteia", "Scheia", "Schitu-Duca", "Sipote", "Siretel", "Stolniceni-Prajescu", "Strunga", "Tansoaia", "Tatarusi", "Tibana", "Tibanesti", "Tiganasi", "Todiresti", "Tomesti", "Trifesti", "Tutora", "Ungheni", "Valea Seaca", "Vulturesti"]},
    {"Bucuresti": ["Bucuresti", "Sectorul 1", "Sectorul 2", "Sectorul 3", "Sectorul 4", "Sectorul 5", "Sectorul 6", "Bucharest"]}
]


def get_county(location: str) -> str:
    location_clean = re.sub(r'\s+', ' ', location).strip()
    location_lower = location_clean.lower()

    for county_dict in counties:
        county_name = list(county_dict.keys())[0]
        cities = county_dict[county_name]
        for city in cities:
            if city.lower() == location_lower:
                return county_name

    return ''
