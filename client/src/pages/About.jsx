import { Users, Code, Palette, Database, Smartphone, Globe } from 'lucide-react';

const About = () => {
  const teamMembers = [
    {
      name: "Supreeth Kumar J",
      role: "Full Stack Developer",
      description: "Lead developer and project architect",
      icon: Code,
      color: "from-blue-500 to-blue-600"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b-1 border-gray-400 text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About Our Team
          </h1>
          <p className="text-xl md:text-2xl text-black">
            Meet the passionate developers behind Occasio
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            We're building the future of event management - a platform that connects people, 
            simplifies event organization, and creates meaningful experiences. Our goal is to 
            make event discovery and participation seamless for everyone.
          </p>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-gray-600">The talented individuals making it all happen</p>
          </div>

          <div className="flex gap-8 justify-center items-center">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${member.color} flex items-center justify-center mx-auto mb-4`}>
                  <member.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
