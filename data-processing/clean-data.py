import pandas as pd

df = pd.read_csv(r'C:\Users\rauc8872\Downloads\European Honey Buzzard_Finland_250.csv')

with pd.option_context('display.max_columns', None):
    print(df.head())

df = df.rename(columns= {
    'individual-local-identifier': 'birdId',
    'individual-taxon-canonical-name': 'birdName',
    'ground-speed': 'speed',
    'event-id': 'id',
    'timestamp': 'timestamp',
    'location-long': 'longitude',
    'location-lat': 'latitude',
'height-above-ellipsoid':'altitude'
})

df = df[['id', 'timestamp', 'longitude', 'latitude', 'speed', 'altitude', 'birdId', 'birdName']]

df = df.dropna(subset=['timestamp', 'longitude', 'latitude', 'birdId'])

df.to_csv('./filtered_file.csv', index=False)

with pd.option_context('display.max_columns', None):
    print(df.head())
