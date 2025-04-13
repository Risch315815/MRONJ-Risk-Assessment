import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="orthopedist"
        options={{
          title: 'Orthopedist',
        }}
      />
      <Tabs.Screen
        name="patient"
        options={{
          title: 'Patient',
        }}
      />
      <Tabs.Screen
        name="dentist"
        options={{
          title: 'Dentist',
        }}
      />
    </Tabs>
  );
} 