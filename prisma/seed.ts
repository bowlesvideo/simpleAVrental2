import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create rental configuration
  await prisma.rentalConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      packages: [
        {
          id: 'meeting-package',
          name: 'Meeting Package',
          price: 2500,
          description: 'Perfect for corporate meetings and presentations',
          image: '/images/meeting-package.jpg',
          keyFeatures: [
            'Professional HD Camera',
            'Audio System',
            'Basic Lighting Kit',
            'Technical Support'
          ],
          includes: [
            'Camera Operator',
            'Audio Technician',
            'Basic Post-Production',
            'Digital File Delivery'
          ]
        },
        {
          id: 'webinar-package',
          name: 'Webinar Package',
          price: 3000,
          description: 'Ideal for virtual events and online presentations',
          image: '/images/webinar-package.jpg',
          keyFeatures: [
            'Multi-Camera Setup',
            'Professional Audio System',
            'Streaming Equipment',
            'Technical Support'
          ],
          includes: [
            'Camera Operators',
            'Audio Engineer',
            'Streaming Technician',
            'Digital Recording'
          ]
        },
        {
          id: 'training-package',
          name: 'Training Package',
          price: 3500,
          description: 'Comprehensive setup for training sessions and workshops',
          image: '/images/training-package.jpg',
          keyFeatures: [
            'Multi-Camera Setup',
            'Wireless Microphones',
            'Professional Lighting',
            'Technical Support'
          ],
          includes: [
            'Camera Operators',
            'Audio Engineer',
            'Lighting Technician',
            'Post-Production Editing'
          ]
        }
      ],
      addOns: [
        {
          id: 'additional-camera',
          name: 'Additional Camera',
          price: 500,
          description: 'Add an extra camera for multiple angles'
        },
        {
          id: 'streaming-service',
          name: 'Live Streaming Service',
          price: 750,
          description: 'Professional streaming to your platform of choice'
        },
        {
          id: 'graphics-package',
          name: 'Graphics Package',
          price: 400,
          description: 'Custom lower thirds and on-screen graphics'
        },
        {
          id: 'audio-recording',
          name: 'Professional Audio Recording',
          price: 300,
          description: 'High-quality audio recording and mixing'
        },
        {
          id: 'lighting-kit',
          name: 'Additional Lighting Kit',
          price: 250,
          description: 'Extra lighting for enhanced video quality'
        }
      ],
      keyFeatures: [],
      addonGroups: [
        {
          id: 'recording-streaming',
          label: 'Recording & Streaming'
        },
        {
          id: 'production-enhancements',
          label: 'Production Enhancements'
        }
      ]
    }
  })

  // Create a customer
  await prisma.customer.create({
    data: {
      id: 'cust001',
      email: 'demo@example.com',
      updatedAt: new Date(),
      orders: {
        create: [
          {
            id: 'ORD240110-001',
            orderDate: new Date('2024-01-10'),
            eventDate: new Date('2024-02-10'),
            total: 3500,
            status: 'confirmed',
            updatedAt: new Date(),
            items: [
              {
                id: 'PKG001',
                name: 'Premium Wedding Package',
                price: 3000,
                quantity: 1,
                type: 'package'
              },
              {
                id: 'ADD001',
                name: 'Extra Microphone',
                price: 500,
                quantity: 1,
                type: 'addon'
              }
            ],
            eventDetails: {
              eventStartTime: '14:00',
              eventEndTime: '22:00',
              eventLocation: '123 Wedding Venue Way, San Francisco, CA 94105',
              companyName: 'Dream Weddings Inc',
              contactName: 'Sarah Johnson',
              contactEmail: 'sarah@dreamweddings.com'
            }
          },
          {
            id: 'ORD240115-001',
            orderDate: new Date('2024-01-15'),
            eventDate: new Date('2024-02-15'),
            total: 2500,
            status: 'pending',
            updatedAt: new Date(),
            items: [
              {
                id: 'PKG002',
                name: 'Corporate Event Package',
                price: 2000,
                quantity: 1,
                type: 'package'
              },
              {
                id: 'ADD002',
                name: 'Projector Screen',
                price: 500,
                quantity: 1,
                type: 'addon'
              }
            ],
            eventDetails: {
              eventStartTime: '09:00',
              eventEndTime: '17:00',
              eventLocation: '456 Conference Center Dr, San Francisco, CA 94105',
              companyName: 'Tech Innovations LLC',
              contactName: 'Michael Chen',
              contactEmail: 'michael@techinnovations.com'
            }
          },
          {
            id: 'ORD240120-001',
            orderDate: new Date('2024-01-20'),
            eventDate: new Date('2024-04-10'),
            total: 3000,
            status: 'pending',
            updatedAt: new Date(),
            items: [
              {
                id: 'PKG003',
                name: 'Birthday Party Package',
                price: 2500,
                quantity: 1,
                type: 'package'
              },
              {
                id: 'ADD003',
                name: 'LED Dance Floor Lights',
                price: 500,
                quantity: 1,
                type: 'addon'
              }
            ],
            eventDetails: {
              eventStartTime: '18:00',
              eventEndTime: '23:00',
              eventLocation: '789 Party Plaza, San Francisco, CA 94105',
              companyName: 'Celebration Events',
              contactName: 'Emily Davis',
              contactEmail: 'emily@celebrationevents.com'
            }
          }
        ]
      }
    }
  })

  console.log('Database seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 