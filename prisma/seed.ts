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
  const customer = await prisma.customer.upsert({
    where: { email: 'stephen@bowlescreative.com' },
    update: {},
    create: {
      email: 'stephen@bowlescreative.com',
      orders: {
        create: [
          {
            orderDate: new Date('2024-01-10'),
            eventDate: new Date('2024-02-10'),
            total: 3500,
            status: 'completed',
            updatedAt: new Date(),
            items: [
              {
                id: 'training-package',
                name: 'Training Package',
                price: 3500,
                quantity: 1,
                type: 'package'
              }
            ],
            eventDetails: {
              eventStartTime: '9:00 AM',
              eventEndTime: '5:00 PM',
              eventLocation: '123 Business Center',
              city: 'Orlando',
              state: 'FL',
              zip: '32801',
              companyName: 'Tech Training Co',
              contactName: 'Stephen Bowles',
              contactEmail: 'stephen@bowlescreative.com',
              contactPhone: '555-0123'
            }
          },
          {
            orderDate: new Date('2024-01-15'),
            eventDate: new Date('2024-02-15'),
            total: 2500,
            status: 'confirmed',
            updatedAt: new Date(),
            items: [
              {
                id: 'meeting-package',
                name: 'Meeting Package',
                price: 2500,
                quantity: 1,
                type: 'package'
              }
            ],
            eventDetails: {
              eventStartTime: '10:00 AM',
              eventEndTime: '2:00 PM',
              eventLocation: '456 Conference Center',
              city: 'Orlando',
              state: 'FL',
              zip: '32803',
              companyName: 'Business Solutions Inc',
              contactName: 'Stephen Bowles',
              contactEmail: 'stephen@bowlescreative.com',
              contactPhone: '555-0123'
            }
          },
          {
            orderDate: new Date('2024-01-20'),
            eventDate: new Date('2024-04-10'),
            total: 3000,
            status: 'pending',
            updatedAt: new Date(),
            items: [
              {
                id: 'webinar-package',
                name: 'Webinar Package',
                price: 3000,
                quantity: 1,
                type: 'package'
              }
            ],
            eventDetails: {
              eventStartTime: '1:00 PM',
              eventEndTime: '4:00 PM',
              eventLocation: '789 Innovation Hub',
              city: 'Orlando',
              state: 'FL',
              zip: '32806',
              companyName: 'Digital Events LLC',
              contactName: 'Stephen Bowles',
              contactEmail: 'stephen@bowlescreative.com',
              contactPhone: '555-0123'
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