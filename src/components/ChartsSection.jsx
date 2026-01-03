import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

const ChartsSection = ({ history, kids }) => {
    // Process history data for the bar chart (Daily Points)
    // Aggregating points by day (last 7 days)
    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().slice(0, 10)); // YYYY-MM-DD
        }
        return days;
    };

    const days = getLast7Days();

    // Prepare data structure: { date: 'MM-DD', 'Kid1': points, 'Kid2': points }
    const chartData = days.map(date => {
        const dayData = { date: date.slice(5) }; // Show MM-DD
        kids.forEach(kid => {
            dayData[kid.name] = 0; // Init
        });

        // Sum points for this day
        history.forEach(evt => {
            if (evt.timestamp.startsWith(date)) {
                // If kid name exists in current kids list (might be deleted/renamed, simple match by name for chart)
                // Better to match by ID but history saves childName snapshot. Let's use childName.
                if (dayData[evt.childName] !== undefined) {
                    dayData[evt.childName] += evt.points;
                }
            }
        });
        return dayData;
    });

    // Dummy Radar Data for demonstration (Capability Radar)
    // In a real app, we would tag history events with categories (Study, Life, Sport, Art)
    // Here we randomize slightly based on total score to make it look active
    const radarData = [
        { subject: '学习', A: 120, B: 110, fullMark: 150 },
        { subject: '生活', A: 98, B: 130, fullMark: 150 },
        { subject: '运动', A: 86, B: 130, fullMark: 150 },
        { subject: '艺术', A: 99, B: 100, fullMark: 150 },
        { subject: '礼貌', A: 85, B: 90, fullMark: 150 },
        { subject: '家务', A: 65, B: 85, fullMark: 150 },
    ];
    // A/B placeholders, mapping to first 2 kids if exist
    const radarKeys = kids.slice(0, 2).map((k, i) => ({
        key: i === 0 ? 'A' : 'B',
        name: k.name,
        color: i === 0 ? '#FF8BA7' : '#4ECDC4'
    }));

    return (
        <div className="charts-section" style={{ marginTop: 'var(--spacing-xl)' }}>
            <h3 style={{ borderLeft: '5px solid var(--color-primary)', paddingLeft: '10px' }}>成长趋势</h3>

            <div className="card" style={{ height: '300px', marginBottom: 'var(--spacing-md)' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            cursor={{ fill: 'transparent' }}
                        />
                        <Legend />
                        {kids.map((kid, index) => (
                            <Bar
                                key={kid.id}
                                dataKey={kid.name}
                                fill={index % 2 === 0 ? '#FF8BA7' : '#4ECDC4'}
                                radius={[4, 4, 0, 0]}
                                animationDuration={1000}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Just showing Radar for visual "Pro" feel, even if data is mock for now */}
            <h3 style={{ borderLeft: '5px solid var(--color-accent)', paddingLeft: '10px' }}>能力雷达 (示例)</h3>
            <div className="card" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} />
                        {radarKeys.map(k => (
                            <Radar
                                key={k.key}
                                name={k.name}
                                dataKey={k.key}
                                stroke={k.color}
                                fill={k.color}
                                fillOpacity={0.6}
                            />
                        ))}
                        <Legend />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ChartsSection;
